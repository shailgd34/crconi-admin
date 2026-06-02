import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
}

const initialToken = localStorage.getItem("auth_token");
const initialEmail = localStorage.getItem("admin_email");
const initialAuthStatus = localStorage.getItem("authenticated") === "true";

const initialState: AuthState = {
  token: initialToken,
  userEmail: initialEmail,
  isAuthenticated: initialAuthStatus,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token?: string; email: string }>
    ) => {
      const { token, email } = action.payload;
      state.token = token || "dummy-token";
      state.userEmail = email;
      state.isAuthenticated = true;

      localStorage.setItem("auth_token", state.token);
      localStorage.setItem("admin_email", email);
      localStorage.setItem("authenticated", "true");
    },
    logout: (state) => {
      state.token = null;
      state.userEmail = null;
      state.isAuthenticated = false;

      localStorage.removeItem("auth_token");
      localStorage.removeItem("admin_email");
      localStorage.removeItem("authenticated");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.userEmail;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
