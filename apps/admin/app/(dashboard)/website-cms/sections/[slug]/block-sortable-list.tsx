"use client";

import type { SiteBlock } from "@prisma/client";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { reorderBlocks } from "../../actions";
import { BlockEditorForm } from "./block-editor-form";

function SortableRow({
  block,
  sectionSlug,
}: {
  readonly block: SiteBlock;
  readonly sectionSlug: string;
}): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="cursor-grab rounded border px-2 py-1 text-xs text-muted-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          Drag
        </button>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {block.type} · order {block.order}
        </span>
      </div>
      <BlockEditorForm block={block} sectionSlug={sectionSlug} />
    </div>
  );
}

export function BlockSortableList({
  sectionSlug,
  blocks: initial,
}: {
  readonly sectionSlug: string;
  readonly blocks: SiteBlock[];
}): React.ReactElement {
  const [blocks, setBlocks] = useState(initial);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function onDragEnd(event: DragEndEvent): Promise<void> {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(next);
    await reorderBlocks(
      sectionSlug,
      next.map((b) => b.id)
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => void onDragEnd(e)}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {blocks.map((b) => (
            <SortableRow key={b.id} block={b} sectionSlug={sectionSlug} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
