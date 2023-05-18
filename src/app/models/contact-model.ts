export class ContactModel {
  // email: String = "";
  // phone: String = "";
  // firstName: String = "";
  // lastName: String = "";
  // message: String = "";
  email;
  phone;
  firstName;
  lastName;
  message;
  constructor(email: string,
    phone: string,
    firstName: string,
    lastName: string,
    message:string)
    {
        this.email= "";
        this.phone = "";
        this.firstName = "";
        this.lastName = "";
        this.message = "";
    }
}
