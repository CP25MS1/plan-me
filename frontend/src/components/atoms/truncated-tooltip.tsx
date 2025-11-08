import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type TruncatedTooltipProps = {
  /** text to render */
  text: string;
  /** optional className to apply to the text element */
  className?: string;
  /** optional aria label for tooltip content (fallback) */
  ariaLabel?: string;
  /** optional wrapper style / class for width constraints (parent may control width) */
  style?: React.CSSProperties;
};

/**
 * Hook to detect whether an inline element's text is truncated.
 * - returns true when scrollWidth > clientWidth
 */
const useIsTruncated = (ref: React.RefObject<HTMLSpanElement>) => {
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);

    // initial check
    check();

    // observe resize / font changes
    let ro: ResizeObserver | undefined;
    try {
      ro = new ResizeObserver(check);
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    } catch {
      // fallback to window resize
      window.addEventListener('resize', check);
    }

    return () => {
      if (ro) {
        try {
          ro.disconnect();
        } catch {
          /* noop */
        }
      } else {
        window.removeEventListener('resize', check);
      }
    };
  }, [ref]);

  return isTruncated;
};

/**
 * TruncatedTooltip
 * - Renders inline text with CSS truncation (nowrap + ellipsis).
 * - Shows Tooltip only when text is actually truncated.
 *
 * Usage:
 * <TruncatedTooltip text={username} className="font-semibold max-w-xs" />
 *
 * Note: prefer to control max-width via className or style on this component's wrapper.
 */
export const TruncatedTooltip: React.FC<TruncatedTooltipProps> = ({
  text,
  className = '',
  ariaLabel,
  style,
}) => {
  const spanRef = React.useRef<HTMLSpanElement>(null!);
  const isTruncated = useIsTruncated(spanRef);

  const textElement = (
    <span
      ref={spanRef}
      className={`inline-block align-middle truncate ${className}`}
      style={{
        // ensure truncation behavior — override maxWidth via style or className
        maxWidth: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        verticalAlign: 'middle',
        ...style,
      }}
      aria-label={ariaLabel ?? text}
      title={text} // optional native title fallback
    >
      {text}
    </span>
  );

  if (!isTruncated) return textElement;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{textElement}</TooltipTrigger>
      <TooltipContent side="top" align="center">
        {/* Use pre or simple span so long emails show nicely */}
        <div className="wrap-break-word text-sm">{text}</div>
      </TooltipContent>
    </Tooltip>
  );
};

export default TruncatedTooltip;
