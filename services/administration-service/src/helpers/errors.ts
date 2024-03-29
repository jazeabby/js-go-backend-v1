export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "AuthenticationError";
  }
}
