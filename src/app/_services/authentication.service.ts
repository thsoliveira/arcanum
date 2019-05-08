import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@app/_models';
import { AppState } from '@app/state/initial';
import { Store } from '@ngrx/store';
import { OpenSession, CloseSession } from '@app/state/general/general.actions';


@Injectable({ providedIn: 'root' })
export class AuthenticationService {
	private currentUserSubject: BehaviorSubject<User>;
	public currentUser: Observable<User>;

	constructor(private _http: HttpClient, private _store: Store<AppState>) {
		this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
		this.currentUser = this.currentUserSubject.asObservable();
	}

	public get currentUserValue(): User {
		return this.currentUserSubject.value;
	}

	public getCurrentUser(): Observable<User>{
		return this.currentUserSubject.asObservable();
	}

	login(username: string, password: string) {
		return this._http.post<any>(`/users/authenticate`, { username, password })
			.pipe(map(user => {
				if (user) {
					// store user details and jwt token in local storage to keep user logged in between page refreshes
					localStorage.setItem('currentUser', JSON.stringify(user));

					this._store.dispatch(new OpenSession(user));

					this.currentUserSubject.next(user);
				}

				return user;
			}));
	}

	logout() {
		this._store.dispatch(new CloseSession());
		// remove user from local storage to log user out
		localStorage.removeItem('currentUser');
		this.currentUserSubject.next(null);
	}
}