import { useQuery, useMutation } from "@tanstack/react-query";
import messageService from "../api/messages";

export const useMessages = () => {
  return useQuery({
    queryKey: ["messages"],
    queryFn: messageService.getAllMessages,
  });
};

export const useActiveMessages = () => {
  return useQuery({
    queryKey: ["activeMessages"],
    queryFn: messageService.getActiveMessages,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: messageService.createMessage,
  });
};

export const useUpdateMessage = () => {
  return useMutation({
    mutationFn: ({ id, ...data }) => messageService.updateMessage(id, data),
  });
};

export const useDeleteMessage = () => {
  return useMutation({
    mutationFn: messageService.deleteMessage,
  });
};