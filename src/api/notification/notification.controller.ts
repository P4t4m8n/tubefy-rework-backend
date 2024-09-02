import { Request, Response } from "express";
import { INotificationDTO } from "./notification.model";
import { notificationService } from "./notification.service";
import { loggerService } from "../../services/logger.service";

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { notificationDTO } = req.body;

    if (!notificationDTO) {
      return res.status(400).send("Notification is required");
    }

    if (!notificationDTO.userId) {
      return res.status(400).send("User ID is required");
    }

    if (!notificationDTO.fromUserId) {
      return res.status(400).send("Sender ID is required");
    }

    if (!notificationDTO.type) {
      return res.status(400).send("Type is required");
    }
    const notification = await notificationService.create(notificationDTO);

    res.status(201).json(notification);
  } catch (error) {
    loggerService.error(`Error creating notification: ${error}`);
    res.status(500).send("Internal server error");
  }
};

export const removeNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send("Notification ID is required");
    }

    await notificationService.remove({id});

    res.status(204).send();
  } catch (error) {
    loggerService.error(`Error removing notification: ${error}`);
    res.status(500).send("Internal server error");
  }
};
