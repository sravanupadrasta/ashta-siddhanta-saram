import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { AuthenticatedUser, UserProfile, UserRole } from '../models/user';

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 8)}-${Date.now().toString(36)}`;
}

interface PasswordReset {
  email: string;
  temporaryPassword: string;
  generatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users: AuthenticatedUser[] = [
    {
      id: 'admin-1',
      name: 'Seed Admin',
      address: 'Chennai, Tamil Nadu',
      email: 'admin@seed-app.in',
      phone: '+91-9999999999',
      role: 'admin',
      password: 'Admin@123',
    },
  ];

  private pendingResets: PasswordReset[] = [];

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();
  private usersSubject = new BehaviorSubject<UserProfile[]>(this.sanitiseUsers(this.users));
  readonly users$ = this.usersSubject.asObservable();

  get currentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<UserProfile | null> {
    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    this.currentUserSubject.next(user ?? null);
    return of(user ?? null).pipe(delay(400));
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  forgotPassword(email: string): Observable<string | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return of(null).pipe(delay(500));
    }
    const tempPassword = `Seed-${Math.random().toString(36).slice(-6)}`;
    user.password = tempPassword;
    const reset: PasswordReset = {
      email: user.email,
      temporaryPassword: tempPassword,
      generatedAt: new Date(),
    };
    this.pendingResets.push(reset);
    return of(tempPassword).pipe(delay(800));
  }

  createUser(input: Omit<AuthenticatedUser, 'id'>): Observable<UserProfile> {
    const user: AuthenticatedUser = { ...input, id: createId(input.role) };
    this.users.push(user);
    this.emitUsers();
    return of(user).pipe(delay(500), map((created) => ({ ...created } as UserProfile)));
  }

  findUsersByRole(role: UserRole): UserProfile[] {
    return this.sanitiseUsers(this.users).filter((user) => user.role === role);
  }

  getUserById(userId: string): UserProfile | undefined {
    const match = this.users.find((user) => user.id === userId);
    if (!match) {
      return undefined;
    }
    const { password, ...profile } = match;
    return profile;
  }

  getAllUsers(): UserProfile[] {
    return this.usersSubject.value;
  }

  private sanitiseUsers(users: AuthenticatedUser[]): UserProfile[] {
    return users.map(({ password, ...profile }) => profile);
  }

  private emitUsers(): void {
    this.usersSubject.next(this.sanitiseUsers(this.users));
  }
}
