"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { ChatbotWidget, ProfileWidget, WidgetDragHandle } from "./dashboard-widgets";
import { TasksWidget, HabitsWidget, FinanceWidget, SocialWidget } from "./aether-widgets";

const WIDGETS: Record<string, React.FC<any>> = {
    tasks: TasksWidget,
    habits: HabitsWidget,
    finance: FinanceWidget,
    social: SocialWidget,
    chatbot: ChatbotWidget,
    profile: ProfileWidget,
};

export function DynamicDashboard({ chatId }: { chatId: string }) {
    const [columns, setColumns] = useState({
        left: ["tasks", "finance"],
        middle: ["habits", "social"],
        right: ["chatbot"],
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceCol = [...columns[source.droppableId as keyof typeof columns]];
        const destCol =
            source.droppableId === destination.droppableId
                ? sourceCol
                : [...columns[destination.droppableId as keyof typeof columns]];

        const [moved] = sourceCol.splice(source.index, 1);
        destCol.splice(destination.index, 0, moved);

        setColumns({
            ...columns,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol,
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="relative w-full overflow-x-auto pb-6 custom-scrollbar">
                <div className="grid min-w-[700px] grid-cols-12 items-start gap-4 px-2 lg:min-w-0 lg:gap-6 lg:px-4">
                    <Droppable droppableId="left">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="col-span-4 flex flex-col gap-4 p-2 xl:col-span-3"
                            >
                                {columns.left.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(p) => (
                                                <div
                                                    ref={p.innerRef}
                                                    {...p.draggableProps}
                                                    className="group relative w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={p.dragHandleProps} />
                                                    {id === "chatbot" ? <Component chatId={chatId} /> : <Component />}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <Droppable droppableId="middle">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="col-span-8 flex flex-col gap-4 p-2 lg:gap-6 xl:col-span-5"
                            >
                                {columns.middle.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(p) => (
                                                <div
                                                    ref={p.innerRef}
                                                    {...p.draggableProps}
                                                    className="group relative w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={p.dragHandleProps} />
                                                    {id === "chatbot" ? <Component chatId={chatId} /> : <Component />}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    <Droppable droppableId="right">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="col-span-12 flex flex-col gap-4 p-2 lg:gap-6 xl:col-span-4"
                            >
                                {columns.right.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(p) => (
                                                <div
                                                    ref={p.innerRef}
                                                    {...p.draggableProps}
                                                    className="group relative w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={p.dragHandleProps} />
                                                    {id === "chatbot" ? <Component chatId={chatId} /> : <Component />}
                                                </div>
                                            )}
                                        </Draggable>
                                    );
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>
            </div>
        </DragDropContext>
    );
}
