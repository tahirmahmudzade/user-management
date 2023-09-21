export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PrismaJson {
    interface Passport {
      issueDate: Date;
      expiryDate: Date;
      issueCountry: string;
      issueAuthority: string;
      passportNumber: string;
    }
  }
}
