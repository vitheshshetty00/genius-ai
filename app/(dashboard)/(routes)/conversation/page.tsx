"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Heading from "@/components/Heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormSchema } from "./constants";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChatCompletionRequestMessage } from "openai";
import { Empty } from "@/components/Empty";
import { Loader } from "@/components/Loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

const ConversationPage = () => {
	const router = useRouter();
	const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			prompt: "",
		},
	});

	const isLoading = form.formState.isSubmitting;

	const onSubmit = async (values: z.infer<typeof FormSchema>) => {
		try {
			const userMessage: ChatCompletionRequestMessage = {
				role: "user",
				content: values.prompt,
			};

			const newMessages = [...messages, userMessage];

			const response = await axios.post("api/conversation", {
				messages: newMessages,
			});
			console.log(response);

			setMessages((current) => [...current, userMessage, response.data]);

			form.reset();
		} catch (error: any) {
			console.log(error);
		} finally {
			router.refresh();
		}
	};

	return (
		<div>
			<Heading
				title="Conversation"
				description="Chat with our most Advanced conversation model"
				icon={MessageSquare}
				iconColor="text-violet-500"
				bgColor="bg-violet-500/10"
			/>
			<div className="px-4 lg:px-8">
				<div>
					<Form {...form}>
						<form
							className="rounded-lg border w-full p-4 px-3  md:px-6  focus-within:shadow-sm  grid grid-cols-12 gap-2"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								name="prompt"
								render={({ field }) => (
									<FormItem className="col-span-12 lg:col-span-10">
										<FormControl className="m-0 p-0">
											<Input
												className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
												disabled={isLoading}
												placeholder="How do i calculate the radius of earth?"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<Button
								className="col-span-12 lg:col-span-2 w-full "
								disabled={isLoading}
							>
								Generate
							</Button>
						</form>
					</Form>
				</div>
				<div className="space-y-4 mt-4">
					{isLoading && (
						<div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
							<Loader />
						</div>
					)}
					{messages.length === 0 && !isLoading && (
						<Empty label="No Conversation Started." />
					)}
					<div className="flex flex-col-reverse gap-y-4">
						{messages.map((message) => (
							<div
								key={message.content}
								className={cn(
									"p-4 md:p-8 w-full flex items-start gap-x-4 rounded-lg",
									message.role === "user"
										? "bg-white border border-black/10"
										: "bg-muted"
								)}
							>
								<div className="flex w-8 h-8">
									{message.role === "user" ? <UserAvatar /> : <BotAvatar />}
								</div>
								<p className="text-sm">{message.content}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ConversationPage;
