export type EmailTemplate = "verification" | "reset" | "security";

export interface SendEmailInput {
  to: string;
  template: EmailTemplate;
  parameters: Record<string, string>;
}

interface OutboxEntry extends SendEmailInput {
  from: string;
  subject: string;
  text: string;
  html: string;
  messageId: string;
}

const outbox: OutboxEntry[] = [];

export function getTestOutbox(): ReadonlyArray<OutboxEntry> {
  return outbox;
}

export function clearTestOutbox(): void {
  outbox.length = 0;
}

function buildMessage(input: SendEmailInput): Omit<OutboxEntry, "messageId"> {
  const from = "obsidi.xyz <noreply@e.obsidi.xyz>";
  switch (input.template) {
    case "verification":
      return {
        ...input,
        from,
        subject: "Verify your obsidi.xyz email",
        text: `Verify your email: ${input.parameters.link ?? ""}`,
        html: `<p>Verify your email: <a href="${input.parameters.link ?? ""}">Verify</a></p>`,
      };
    case "reset":
      return {
        ...input,
        from,
        subject: "Reset your obsidi.xyz password",
        text: `Reset your password: ${input.parameters.link ?? ""}`,
        html: `<p>Reset your password: <a href="${input.parameters.link ?? ""}">Reset</a></p>`,
      };
    case "security":
      return {
        ...input,
        from,
        subject: "Security notice for your obsidi.xyz account",
        text: input.parameters.message ?? "A security event occurred.",
        html: `<p>${input.parameters.message ?? "A security event occurred."}</p>`,
      };
  }
}

interface EmailBinding {
  send: (message: {
    from: string;
    to: string;
    subject: string;
    text: string;
    html: string;
  }) => Promise<{ messageId: string } | void> | { messageId: string } | void;
}

export async function sendTransactionalEmail(
  env: { EMAIL?: EmailBinding },
  input: SendEmailInput
): Promise<{ messageId: string }> {
  const message = buildMessage(input);
  if (env.EMAIL && typeof env.EMAIL.send === "function") {
    const result = await env.EMAIL.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    const messageId =
      result && typeof result === "object" && "messageId" in result
        ? String((result as { messageId: string }).messageId)
        : `email-${Date.now()}`;
    return { messageId };
  }
  const messageId = `test-${outbox.length + 1}`;
  outbox.push({ ...message, messageId });
  return { messageId };
}
