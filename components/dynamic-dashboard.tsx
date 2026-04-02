"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { 
    ProfileWidget, 
    AccordionsWidget, 
    ProgressWidget, 
    CalendarWidget, 
    MetricsWidget, 
    ChatbotWidget,
    WidgetDragHandle
} from "./dashboard-widgets";

const WIDGETS: Record<string, React.FC<any>> = {
    profile: ProfileWidget,
    accordions: AccordionsWidget,
    progress: ProgressWidget,
    calendar: CalendarWidget,
    metrics: MetricsWidget,
    chatbot: ChatbotWidget
};

export function DynamicDashboard({ chatId }: { chatId: string }) {
    const [columns, setColumns] = useState({
        left: ["profile", "accordions"],
        middle: ["progress", "calendar"],
        right: ["metrics", "chatbot"]
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceCol = [...columns[source.droppableId as keyof typeof columns]];
        const destCol = source.droppableId === destination.droppableId ? sourceCol : [...columns[destination.droppableId as keyof typeof columns]];

        const [moved] = sourceCol.splice(source.index, 1);
        destCol.splice(destination.index, 0, moved);

        setColumns({
            ...columns,
            [source.droppableId]: sourceCol,
            [destination.droppableId]: destCol
        });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-1 w-full overflow-x-auto overflow-y-hidden custom-scrollbar min-h-0 relative">
                <div className="min-w-[700px] xl:min-w-0 grid grid-cols-12 gap-4 lg:gap-6 px-2 lg:px-4 pb-4 h-full">
                    
                    {/* Left Column (col-3) */}
                    <Droppable droppableId="left">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                                className="col-span-4 xl:col-span-3 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 min-h-0 h-full p-2"
                            >
                                {columns.left.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(provided) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="relative group w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={provided.dragHandleProps} />
                                                    <Component chatId={chatId} />
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* Middle Column (col-5) */}
                    <Droppable droppableId="middle">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps} 
                                className="col-span-8 xl:col-span-5 flex flex-col gap-4 lg:gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0 h-full p-2"
                            >
                                {columns.middle.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(provided) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="relative group w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={provided.dragHandleProps} />
                                                    <Component chatId={chatId} />
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                })}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>

                    {/* Right Column (col-4) */}
                    <Droppable droppableId="right">
                        {(provided) => (
                            <div 
                                {...provided.droppableProps} 
                                className="col-span-12 xl:col-span-4 flex flex-col gap-4 lg:gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0 h-full p-2"
                            >
                                {columns.right.map((id, index) => {
                                    const Component = WIDGETS[id];
                                    return (
                                        <Draggable key={id} draggableId={id} index={index}>
                                            {(provided) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="relative group w-full"
                                                >
                                                    <WidgetDragHandle dragHandleProps={provided.dragHandleProps} />
                                                    <Component chatId={chatId} />
                                                </div>
                                            )}
                                        </Draggable>
                                    )
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
