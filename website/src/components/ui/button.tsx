import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-700/20',
        /** Muted gold with dark text (gold is too light for white text). For sage backgrounds. */
        accent: 'bg-accent-500 text-ink shadow-sm hover:-translate-y-0.5 hover:bg-accent-400 hover:shadow-lg',
        secondary: 'bg-white text-ink ring-1 ring-line shadow-sm hover:-translate-y-0.5 hover:ring-brand-200 hover:shadow-md',
        ghost: 'text-body hover:bg-brand-50 hover:text-brand-700',
        link: 'text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 text-[0.95rem]',
        sm: 'h-9 px-4 text-sm',
        lg: 'h-13 px-8 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a Link) with button styling. */
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
