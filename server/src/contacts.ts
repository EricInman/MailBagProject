import * as path from "path";
const Datastore = require("nedb");

// defines a Contact 
export interface IContact {
  _id?: number,
  name: string, 
  email: string
}

// defines the worker class for the main to use and make calls from 
export class Worker {
  private db: Nedb;
  constructor() {
    this.db = new Datastore({
      filename: path.join(__dirname, "contacts.db"),
      autoload: true
    });
  }

  // lists all the contacts
  public listContacts(): Promise<IContact[]> {
    return new Promise((inResolve, inReject) => {
      this.db.find({ }, 
        (inError: Error, inDocs: IContact[]) => {
          if(inError) {
            inReject(inError);
          } else {
            inResolve(inDocs);  
          }
        }
      );
    });
  }

  // adds a contact to the server
  public addContact(inContact: IContact): Promise<IContact> {
    return new Promise((inResolve, inReject) => {
      this.db.insert(inContact, 
        (inError: Error | null, inNewDoc: IContact) => {
          if(inError) {
            inReject(inError || "inError was null");
          } else {
            inResolve(inNewDoc);
          }
        });
    });
  }

  // deletes a contact from the server
  public deleteContact(inID: string): Promise<string> {
    return new Promise((inResolve, inReject) => {
      this.db.remove({_id: inID}, { }, 
        (inError: Error | null, inNumRemoved: number) => {
          if(inError) {
            inReject(inError || "inError was null");
          } else {
            inResolve();
          }
        });
    });
  }
}