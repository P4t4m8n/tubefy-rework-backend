export interface IUser {
  username: string;
  imgUrl?: string | null;
  isAdmin?: boolean;
  id?: string;
}

export interface IDetailedUser {
  email: string;
}

export interface IUserLoginDTO {
  password?: string;
  email: string;
}

export interface IUserSignupDTO {
  password: string;
  email: string;
  username: string;
  imgUrl?: string;
}

export interface IUserDTO {
  username: string;
  email: string;
  password?: string;
  imgUrl: string | null | undefined;
  isAdmin?: boolean;
  id?: string;
}

export interface IUserFilters {
  username?: string;
  email?: string;
}
