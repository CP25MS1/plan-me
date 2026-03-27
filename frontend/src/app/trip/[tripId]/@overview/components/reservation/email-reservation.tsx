'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@mui/material';
import { ReactNode, ElementType, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Building, Bus, Car, Copy, Eye, Mail, Plane, Ship, Train, Trash2, Utensils, X } from 'lucide-react';
import CircularProgress from '@mui/material/CircularProgress';
import { BackButton } from '@/components/button';
import { useGetReservationEmailInfo } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-reservation-email-info';
import { useGetPreviewsReservation } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-get-previews-reservation';
import { ReservationDto, ReservationType } from '@/api/reservations/type';
import { useCreateReservationBulk } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-create-reservation-bulk';
import { useReadEmailInbox } from '@/app/trip/[tripId]/@overview/hooks/reservations/use-read-email-inbox';
import { AppSnackbar } from '@/components/common/snackbar/snackbar';
import { AlertColor } from '@mui/material/Alert';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import useTripAddPresenceEffect from '@/app/trip/[tripId]/realtime/hooks/use-trip-add-presence';
import { useTripReservations } from '@/api/trips';
import ConfirmDialog from '@/components/common/dialog/confirm-dialog';
import { hasAnyDuplicate, renderReservationCard } from './shared/reservation-utils';

import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

interface EmailReservationProps {
  open: boolean;
  onClose: () => void;
}

interface EmailItem {
  emailId: number;
  subject: string;
  receivedAt: string;
  type: ReservationType | '';
  error?: boolean;
}

const types = ['LODGING', 'RESTAURANT', 'FLIGHT', 'TRAIN', 'BUS', 'FERRY', 'CAR_RENTAL'];
const icons: Record<ReservationType, ReactNode> = {
  LODGING: <Building size={18} color="#25CF7A" />, RESTAURANT: <Utensils size={18} color="#25CF7A" />,
  FLIGHT: <Plane size={18} color="#25CF7A" />, TRAIN: <Train size={18} color="#25CF7A" />,
  BUS: <Bus size={18} color="#25CF7A" />, FERRY: <Ship size={18} color="#25CF7A" />, CAR_RENTAL: <Car size={18} color="#25CF7A" />,
};

export default function EmailReservation({ open, onClose }: EmailReservationProps) {
  const { tripId: tripIdParam } = useParams<{ tripId: string }>();
  const tripId = Number(tripIdParam);
  const { t } = useTranslation('trip_overview');
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const { refetch: refetchEmailInfos, isFetching } = useGetReservationEmailInfo(tripId);
  const { data: existingReservations = [] } = useTripReservations(tripId);

  useTripAddPresenceEffect({ tripId, enabled: open, section: 'OVERVIEW_RESERVATIONS' });

  const [showPreview, setShowPreview] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Record<number, ReservationType>>({});
  const [copiedAlert, setCopiedAlert] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    if (open) {
      setEmails([]); setShowPreview(false); setSelectedTypes({});
    }
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
  };

  const checkEmails = async () => {
    setEmails([]); setSelectedTypes({}); setShowPreview(false);
    const { data } = await refetchEmailInfos();
    if (data) setEmails(data.map(e => ({ emailId: e.emailId, subject: e.subject, receivedAt: dayjs(e.sentAt.replace(' ICT', '')).fromNow(), type: '' })));
  };

  const removeEmail = (index: number) => {
    setEmails(prev => prev.filter((_, i) => i !== index));
    setSelectedTypes(prev => { const updated = { ...prev }; delete updated[index]; return updated; });
  };

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor; duration?: number }>({ open: false, message: '', severity: 'error' });

  const showErrorSnackbar = (error: unknown) => {
    if (!(error instanceof AxiosError)) return;
    const thMessage = error.response?.data?.message?.TH;
    if (typeof thMessage === 'string') setSnackbar({ open: true, message: thMessage, severity: 'error' });
  };

  const isAllSelected = emails.length > 0 && emails.every((_, index) => !!selectedTypes[index]);

  const handleTypeChange = (index: number, value: ReservationType) => {
    setSelectedTypes(prev => ({ ...prev, [index]: value }));
    setEmails(prev => prev.map((item, i) => i === index ? { ...item, error: false, type: value } : item));
  };

  const { mutateAsync: getPreviews, isPending } = useGetPreviewsReservation();
  const [previewReservations, setPreviewReservations] = useState<ReservationDto[]>([]);

  const handlePreview = async () => {
    let hasErr = false;
    const updated = emails.map((item, i) => {
      if (!selectedTypes[i]) { hasErr = true; return { ...item, error: true }; }
      return { ...item, error: false };
    });
    setEmails(updated);
    if (hasErr) {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก', severity: 'error', duration: 5000 });
      return;
    }
    try {
      const result = await getPreviews({ tripId, emails: emails.map((e, i) => ({ emailId: e.emailId, type: selectedTypes[i] })) });
      setPreviewReservations(result); setShowPreview(true);
    } catch {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาด หรือเนื้อหาในอีเมลไม่สอดคล้องกับประเภทการจองที่เลือก', severity: 'error', duration: 5000 });
    }
  };

  const { mutateAsync: createBulk, isPending: isCreating } = useCreateReservationBulk(tripId);
  const { mutateAsync: readEmailInbox } = useReadEmailInbox();

  const handleConfirm = () => {
    if (hasAnyDuplicate(previewReservations, existingReservations)) {
      setShowDuplicateWarning(true);
      return;
    }
    proceedConfirm();
  };

  const proceedConfirm = async () => {
    try {
      await createBulk(previewReservations);
      setSnackbar({ open: true, message: 'เพิ่มข้อมูลการจองสำเร็จ', severity: 'success' });
      setShowPreview(false); onClose();
      await readEmailInbox({ emailIds: emails.map(e => e.emailId) });
      refetchEmailInfos();
    } catch (err) { showErrorSnackbar(err); }
  };

  const selectedCount = emails.filter((e) => e.type && !e.error).length;

  return (
    <>
      <Dialog open={open && !showPreview} onClose={(_, reason) => reason !== 'backdropClick' && onClose()} fullWidth PaperProps={{ sx: { width: 720, height: 600, borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          ส่งต่อข้อมูลการจองผ่านอีเมล
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #d0d0d0', px: 1.5, py: 1, mb: 2 }}>
            <Typography sx={{ flexGrow: 1, color: 'grey.700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>cp25ms1+{tripId}@gmail.com</Typography>
            <Tooltip title="Copy"><IconButton onClick={() => copyToClipboard(`cp25ms1+${tripId}@gmail.com`)} size="small"><Copy size={18} /></IconButton></Tooltip>
          </Box>
          <Button variant="contained" startIcon={!isFetching && <Mail size={18} />} onClick={checkEmails} disabled={isFetching || isPending} sx={{ mb: 2, bgcolor: '#25CF7A', minWidth: 180, position: 'relative' }}>
            <span style={{ visibility: isFetching ? 'hidden' : 'visible' }}>เช็คอีเมลที่เข้ามา</span>
            {isFetching && <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />}
          </Button>
          {emails.length > 0 && <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Typography variant="subtitle2">อีเมล ({selectedCount}/{emails.length})</Typography></Box>}
          <Box ref={containerRef} sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {emails.map((item, index) => (
              <Box key={item.emailId} sx={{ border: item.error ? '2px solid red' : '1px solid grey', borderRadius: 2, p: 2, position: 'relative' }}>
                <IconButton onClick={() => removeEmail(index)} sx={{ position: 'absolute', right: 0, top: 0 }} size="small"><Trash2 size={18} /></IconButton>
                <Typography>{item.subject}</Typography>
                <Typography sx={{ fontSize: 12, color: 'grey.600' }}>{item.receivedAt}</Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Select value={selectedTypes[index] || ''} displayEmpty onChange={(e) => handleTypeChange(index, e.target.value as ReservationType)} error={!!item.error}
                    renderValue={(sel) => sel ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{icons[sel as keyof typeof icons]} {t(`EmailReservation.Type.${sel}`)}</Box> : t('ManualReservation.placeholder')}>
                    {types.map((type) => {
                      const IconComp = { LODGING: Building, RESTAURANT: Utensils, FLIGHT: Plane, TRAIN: Train, BUS: Bus, FERRY: Ship, CAR_RENTAL: Car }[type] as ElementType;
                      return <MenuItem key={type} value={type} className="flex items-center gap-3"><IconComp size={18} color="#25CF7A" /> {t(`EmailReservation.Type.${type}`)}</MenuItem>;
                    })}
                  </Select>
                </FormControl>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" startIcon={!isPending && <Eye size={18} />} onClick={handlePreview} disabled={isPending || !isAllSelected} sx={{ bgcolor: isAllSelected ? '#25CF7A' : 'grey.400', minWidth: 150, position: 'relative' }}>
              <span style={{ visibility: isPending ? 'hidden' : 'visible' }}>แสดงตัวอย่าง</span>
              {isPending && <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onClose={(_, reason) => reason !== 'backdropClick' && setShowPreview(false)} fullWidth PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}><BackButton onBack={() => setShowPreview(false)} /></Box>
          ตัวอย่างข้อมูล
          <IconButton onClick={() => { setShowPreview(false); onClose(); }} sx={{ position: 'absolute', right: 8, top: 8 }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}><Typography variant="subtitle2">อีเมล ({selectedCount}/{selectedCount})</Typography></Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {previewReservations.map((item, index) => <Box key={index}>{renderReservationCard(item.type, item, index)}</Box>)}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={handleConfirm} disabled={isCreating} sx={{ bgcolor: '#25CF7A', minWidth: 120, position: 'relative' }}>
              <span style={{ visibility: isCreating ? 'hidden' : 'visible' }}>ยืนยัน</span>
              {isCreating && <CircularProgress size={20} color="inherit" sx={{ position: 'absolute' }} />}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <AppSnackbar open={copiedAlert} message="คัดลอกอีเมลแล้ว" severity="success" onClose={() => setCopiedAlert(false)} />
      <AppSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} />

      <ConfirmDialog open={showDuplicateWarning} onClose={() => setShowDuplicateWarning(false)}
        onConfirm={() => { setShowDuplicateWarning(false); proceedConfirm(); }}
        confirmLoading={isCreating} color="warning"
        content={<Box><Typography variant="h6" fontWeight={600} mb={1}>{t('ManualReservation.duplicateWarning.title')}</Typography><Typography>{t('ManualReservation.duplicateWarning.message')}</Typography></Box>}
        confirmLabel={t('ManualReservation.duplicateWarning.accept') as string} cancelLabel={t('ManualReservation.duplicateWarning.cancel') as string}
      />
    </>
  );
}
