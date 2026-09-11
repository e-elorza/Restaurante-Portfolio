"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export type SortableItem = {
  id: string;
  content: React.ReactNode;
};

/**
 * Lista reordenável por arrastar e soltar (com suporte a teclado).
 * A nova ordem é enviada para o servidor assim que o item é solto.
 */
export function SortableList({
  items,
  action,
  emptyMessage,
  className,
}: {
  items: SortableItem[];
  action: (formData: FormData) => Promise<void>;
  emptyMessage?: string;
  className?: string;
}) {
  const [pending, startTransition] = React.useTransition();

  // Guardamos apenas a ordem dos identificadores: o conteúdo de cada linha é
  // sempre lido da lista mais recente vinda do servidor.
  const serverOrder = React.useMemo(() => items.map((item) => item.id), [items]);
  const [orderIds, setOrderIds] = React.useState(serverOrder);
  const [lastServerOrder, setLastServerOrder] = React.useState(serverOrder);

  // Quando o servidor devolve uma ordem diferente (item criado, removido ou
  // reordenado em outra aba), adotamos a ordem dele.
  if (serverOrder.join("|") !== lastServerOrder.join("|")) {
    setLastServerOrder(serverOrder);
    setOrderIds(serverOrder);
  }

  const byId = React.useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const order = React.useMemo(
    () =>
      orderIds
        .map((id) => byId.get(id))
        .filter((item): item is SortableItem => item !== undefined),
    [orderIds, byId],
  );

  // O dnd-kit gera identificadores para os avisos de acessibilidade. Sem um id
  // fixo, o servidor e o navegador geram números diferentes e o React reclama
  // de divergência na hidratação.
  const contextId = React.useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.findIndex((item) => item.id === active.id);
    const newIndex = order.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = orderIds;
    const next = arrayMove(order, oldIndex, newIndex).map((item) => item.id);
    setOrderIds(next);

    const formData = new FormData();
    for (const id of next) formData.append("ids", id);

    startTransition(async () => {
      try {
        await action(formData);
        toast.success("Nova ordem salva.");
      } catch {
        setOrderIds(previous);
        toast.error("Não foi possível salvar a nova ordem.");
      }
    });
  }

  if (order.length === 0 && emptyMessage) {
    return <p className="admin-hint">{emptyMessage}</p>;
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Item ${active.id} pego para reordenar.`,
          onDragOver: () => "Movendo item.",
          onDragEnd: () => "Nova ordem aplicada.",
          onDragCancel: () => "Reordenação cancelada.",
        },
      }}
    >
      <SortableContext
        items={order.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className={cn("space-y-2", pending && "opacity-70", className)}>
          {order.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {item.content}
            </SortableRow>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "admin-card flex items-stretch gap-0 overflow-hidden",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/40",
      )}
    >
      <button
        type="button"
        className="flex shrink-0 cursor-grab items-center border-r border-border px-2 text-subtle-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" aria-hidden />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
