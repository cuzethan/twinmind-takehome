import React from 'react';

interface ColumnProps {
  title?: string;
  titleRight?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Column({ title, titleRight, children }: ColumnProps) {
  return (
    <section className="tm-panel flex h-full min-w-0 flex-1 flex-col overflow-hidden p-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="tm-panel-title">{title}</h2>
        {titleRight}
      </div>
      <div className="mt-2 min-h-0 flex-1 overflow-hidden">{children}</div>
    </section>
  );
}