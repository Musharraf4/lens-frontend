"use client";

import CreatePassword from "./CreatePassword";

export default async function CreatePasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string }>;
}) {
    const { token } = await searchParams;
    return <CreatePassword token={token} />;
}
