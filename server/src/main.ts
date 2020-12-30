import path from "path";
import express,
  { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from "./Contacts";
import SMTPConnection from "nodemailer/lib/smtp-connection";

const app: Express = express();

// setting up middleware 
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "../../client/dist")));
app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction){
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});

// gets all the mailboxes
app.get("/mailboxes", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
      inResponse.json(mailboxes);
    } catch (inError) {
      inResponse.send("Error in retrieving mailboxes");
    }
});

// gets all the messages in a mailbox 
app.get("/mailboxes/:mailbox", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messages: IMAP.IMessage[] = await imapWorker.listMessages({
          mailbox: inRequest.params.mailbox
      });
      inResponse.json(messages);
    } catch (inError) {
      inResponse.send("Error in retrieving messages");
    }
});

// retrieves a specific message from the mailbox
app.get("/mailboxes/:mailbox/:id", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const message: string = await imapWorker.getMessageBody({
        mailbox: inRequest.params.mailbox,
        id: parseInt(inRequest.params.id, 10)
      });
      inResponse.send(message);
    } catch (inError) {
      inResponse.send("Error in retrieving a specific message");
    }
});

// deletes a specific message from the mailbox
app.delete("/mailboxes/:mailbox/:id", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      await imapWorker.deleteMessage({
          mailbox: inRequest.params.mailbox,
          id: parseInt(inRequest.params.id, 10)
      })
      inResponse.send("Message deleted");
    } catch (inError) {
      inResponse.send("Error in deleting the message");
    }
});

// allows a message to be sent
app.post("/messages", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
      await smtpWorker.sendMessage(inRequest.body);
      inResponse.send("Message sent");
    } catch (inError) {
      inResponse.send("Error in sending the message");
    }
});

// gets all the contacts
app.get("/contacts", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contacts: IContact[] = await contactsWorker.listContacts();
      inResponse.json(contacts);
    } catch (inError) {
      inResponse.send("Error in getting contacts");
    }
});

// adds a new contact to the list of contacts
app.post("/contacts", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contact: IContact = await contactsWorker.addContact(inRequest.body);
      inResponse.json(contact);
    } catch (inError) {
      inResponse.send("Error in adding a new contact");
    }
});

// deletes a contact
app.delete("/contacts/:id", 
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(inRequest.params.id);
      inResponse.send("Contact deleted");
    } catch (inError) {
      inResponse.send("Error in deleting contact");
    }
})