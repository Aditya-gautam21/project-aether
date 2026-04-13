"use client";

import { useState } from "react";
import { nanoid } from "nanoid";
import { VitalityHeader } from "@/components/vitality-header";
import { DynamicDashboard } from "@/components/dynamic-dashboard";

export default function LifeOsPage() {
    const [chatId] = useState(() => nanoid());

    return (
        <>
            <VitalityHeader showWelcome />
            <DynamicDashboard chatId={chatId} />
        </>
    );
}
