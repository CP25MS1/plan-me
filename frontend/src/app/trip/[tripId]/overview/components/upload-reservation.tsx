'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useState, useRef, useEffect } from 'react';
import LodgingCard from '@/app/trip/[tripId]/overview/components/cards/lodging';
import RestaurantCard from '@/app/trip/[tripId]/overview/components/cards/restaurant';
import FlightCard from '@/app/trip/[tripId]/overview/components/cards/flight';
import TrainCard from '@/app/trip/[tripId]/overview/components/cards/train';
import BusCard from '@/app/trip/[tripId]/overview/components/cards/bus';
import FerryCard from '@/app/trip/[tripId]/overview/components/cards/ferry';
import CarRentalCard from '@/app/trip/[tripId]/overview/components/cards/carrental';
import { BackButton } from '@/components/button';

interface UploadReservationProps {
  open: boolean;
  onClose: () => void;
}

const types = ['Lodging', 'Restaurant', 'Flight', 'Train', 'Bus', 'Ferry', 'CarRental'];

interface FileItem {
  file: File;
  type: string;
  error: boolean;
}

export default function UploadReservation({ open, onClose }: UploadReservationProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setFiles([]);
      setShowPreview(false);
    }
  }, [open]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => ({
      file: f,
      type: '',
      error: false,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTypeChange = (index: number, value: string) => {
    setFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, type: value, error: false } : item))
    );
  };

  const handlePreview = () => {
    let hasError = false;
    const updatedFiles = files.map((item) => {
      if (!item.type) {
        hasError = true;
        return { ...item, error: true };
      }
      return item;
    });

    setFiles(updatedFiles);

    if (hasError && containerRef.current) {
      const firstErrorIndex = updatedFiles.findIndex((f) => f.error);
      const element = containerRef.current.children[firstErrorIndex] as HTMLElement;
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setShowPreview(true);
  };

  const renderCard = (type: string) => {
    switch (type) {
      case 'Lodging':
        return <LodgingCard />;
      case 'Restaurant':
        return <RestaurantCard />;
      case 'Flight':
        return <FlightCard />;
      case 'Train':
        return <TrainCard />;
      case 'Bus':
        return <BusCard />;
      case 'Ferry':
        return <FerryCard />;
      case 'CarRental':
        return <CarRentalCard />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog
        open={open && !showPreview}
        onClose={onClose}
        fullWidth
        PaperProps={{
          sx: {
            width: 500,
            height: 600,
            borderRadius: 3,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          อัพโหลดข้อมูลการจอง
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 2,
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Placeholder */}
          {files.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                py: 4,
                flexGrow: 1,
                borderRadius: 2,
              }}
              onClick={() => document.getElementById('upload-input')?.click()}
            >
              <input
                id="upload-input"
                type="file"
                style={{ display: 'none' }}
                multiple
                onChange={handleFilesChange}
              />
              <UploadIcon sx={{ fontSize: 50, color: 'grey.500' }} />
              <Typography>ลากหรือวางไฟล์ที่นี่</Typography>
              <Typography>หรือคลิกเพื่อเรียกดู</Typography>
            </Box>
          )}

          {/* File list */}
          {files.length > 0 && (
            <Box
              ref={containerRef}
              sx={{
                flexGrow: 1, // list กินพื้นที่ที่เหลือ
                overflowY: 'auto',
              }}
            >
              {files.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    border: item.error ? '2px solid red' : '1px solid grey',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    position: 'relative',
                  }}
                >
                  <IconButton
                    onClick={() => removeFile(index)}
                    sx={{ position: 'absolute', right: 0, top: 0 }}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Typography sx={{ mb: 1 }}>{item.file.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'green', mb: 1 }}>
                    ขนาด: {(item.file.size / 1024).toFixed(2)} KB | ไฟล์อัพโหลดสมบูรณ์
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={item.type}
                      displayEmpty
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      sx={{
                        borderRadius: 2,
                        color: item.type === '' ? 'grey.500' : 'text.primary',
                      }}
                    >
                      <MenuItem value="" disabled>
                        เลือกประเภทข้อมูลการจอง
                      </MenuItem>
                      {types.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}
            </Box>
          )}

          {/* Preview button fixed at bottom */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', pb: 1 }}>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={handlePreview}
              sx={{
                bgcolor: files.length > 0 ? '#25CF7A' : 'grey.400',
                pointerEvents: files.length > 0 ? 'auto' : 'none',
              }}
            >
              แสดงตัวอย่าง
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        fullWidth
        PaperProps={{ sx: { width: 500, height: 600, borderRadius: 3, p: 2 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 600, position: 'relative' }}>
          <Box sx={{ position: 'absolute', left: 8, top: 8 }}>
            <BackButton onBack={() => setShowPreview(false)} />
          </Box>
          ตัวอย่างข้อมูล
          <IconButton
            onClick={() => setShowPreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            p: 0,
            height: '100%',
          }}
        >
          {/* List ของไฟล์ / Card */}
          <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1, pt: 1 }}>
            {files.map((item, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>{item.file.name}</Typography>
                {renderCard(item.type)}
              </Box>
            ))}
          </Box>

          {/* ปุ่มยืนยันด้านล่าง */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, pb: 1 }}>
            <Button variant="contained" sx={{ bgcolor: '#25CF7A' }} onClick={onClose}>
              ยืนยัน
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
