import { useState, useRef, Fragment, ReactNode } from 'react';
import {
  Button,
  ButtonGroup,
  Popper,
  Grow,
  Paper,
  ClickAwayListener,
  MenuList,
  MenuItem,
} from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { ChevronDown } from 'lucide-react';

export type SplitButtonProps = {
  mainBtn: ReactNode;
  options: {
    key: string;
    content: ReactNode | string;
    onClick: () => void;
  }[];
  sx?: SxProps<Theme>;
  variant?: 'text' | 'outlined' | 'contained';
};

export const SplitButton = ({ mainBtn, options, sx, variant }: SplitButtonProps) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleClose = (event: Event) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Fragment>
      <ButtonGroup ref={anchorRef} sx={{ justifyContent: 'center', ...sx }}>
        {mainBtn}
        <Button
          variant={variant}
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          onClick={() => setOpen((prevOpen) => !prevOpen)}
        >
          <ChevronDown />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        sx={{ zIndex: 1 }}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'right bottom',
            }}
          >
            <Paper sx={{ marginY: '0.5rem' }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option) => (
                    <MenuItem key={option.key} onClick={() => option.onClick()}>
                      {option.content}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Fragment>
  );
};

export default SplitButton;
