import React from 'react';

// Heading Component
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: 'h1' | 'h2' | 'h3';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  children: React.ReactNode;
}

export function Heading({
  variant = 'h2',
  as,
  children,
  className = '',
  ...props
}: HeadingProps) {
  const Component = as || variant;

  let styleClass = "";
  if (variant === 'h1') {
    styleClass = "font-display font-light leading-[0.95] text-ink";
  } else if (variant === 'h2') {
    styleClass = "font-display font-light text-[clamp(1.75rem,5vw,3rem)] leading-tight text-ink";
  } else if (variant === 'h3') {
    styleClass = "font-display font-light text-[clamp(1.25rem,3.5vw,1.75rem)] leading-normal text-ink-soft";
  }

  return (
    <Component className={`${styleClass} ${className}`} {...props}>
      {children}
    </Component>
  );
}

// Subtitle Component
interface SubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
}

export function Subtitle({
  as: Component = 'p',
  children,
  className = '',
  ...props
}: SubtitleProps) {
  return (
    <Component
      className={`font-body text-[10px] md:text-xs tracking-[0.4em] uppercase text-ink-muted ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

// Body Component
interface BodyProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'regular' | 'small' | 'large';
  as?: 'p' | 'span' | 'div';
  children: React.ReactNode;
}

export function Body({
  variant = 'regular',
  as: Component = 'p',
  children,
  className = '',
  ...props
}: BodyProps) {
  let sizeClass = "text-sm md:text-base leading-relaxed text-ink-soft";
  if (variant === 'small') {
    sizeClass = "text-xs md:text-sm leading-normal text-ink-muted";
  } else if (variant === 'large') {
    sizeClass = "text-base md:text-lg leading-relaxed text-ink";
  }

  return (
    <Component
      className={`font-body ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
