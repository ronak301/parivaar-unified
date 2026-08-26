'use client';

import { chakra } from '@chakra-ui/react';

import { cn } from '@/lib/utils';

const ChakraTable = chakra('table');
const ChakraThead = chakra('thead');
const ChakraTbody = chakra('tbody');
const ChakraTfoot = chakra('tfoot');
const ChakraTr = chakra('tr');
const ChakraTh = chakra('th');
const ChakraTd = chakra('td');
const ChakraCaption = chakra('caption');

function Table({ className, ...props }: React.ComponentProps<typeof ChakraTable>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <ChakraTable
        data-slot="table"
        className={cn('w-full caption-bottom text-[0.9rem]', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<typeof ChakraThead>) {
  return (
    <ChakraThead data-slot="table-header" className={cn('[&_tr]:border-b', className)} {...props} />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<typeof ChakraTbody>) {
  return (
    <ChakraTbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<typeof ChakraTfoot>) {
  return (
    <ChakraTfoot
      data-slot="table-footer"
      className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<typeof ChakraTr>) {
  return (
    <ChakraTr
      data-slot="table-row"
      className={cn(
        'border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<typeof ChakraTh>) {
  return (
    <ChakraTh
      data-slot="table-head"
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<typeof ChakraTd>) {
  return (
    <ChakraTd
      data-slot="table-cell"
      className={cn('p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<typeof ChakraCaption>) {
  return (
    <ChakraCaption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
