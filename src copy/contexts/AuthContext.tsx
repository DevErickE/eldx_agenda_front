import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, db } from '../services/db';

interface AuthContextType {
  client: Client | null;
  isAdmin: boolean;
  login: (identifier: string, cpfOrEmail: string) => { success: boolean; error?: string };
  logout: () => void;
  registerClient: (clientData: Omit<Client, 'id' | 'active' | 'createdAt'>) => { success: boolean; client?: Client; error?: string };
  updateProfile: (updatedClient: Client) => { success: boolean; error?: string };
  recoverPassword: (email: string) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in in localStorage
    const loggedUser = db.getLoggedUser();
    if (loggedUser) {
      if (loggedUser.admin) {
        setIsAdmin(true);
      } else if (loggedUser.client) {
        setClient(loggedUser.client);
      }
    }
  }, []);

  const login = (identifier: string, password: string) => {
    // Clean identifier (CPF or Email)
    const cleanId = identifier.trim().toLowerCase();

    // Check if it's Admin
    if (cleanId === 'admin@clinica.com.br' && password === 'admin123') {
      setIsAdmin(true);
      setClient(null);
      db.setLoggedUser({ admin: true });
      db.addAuditLog('admin', 'Dr. Roberto Podólogo (Adm)', 'Admin', 'LOGIN', 'Login administrativo efetuado com sucesso.');
      return { success: true };
    }

    // Try finding client by Email or CPF
    let clientFound = db.getClientByEmail(cleanId);
    if (!clientFound) {
      // Clean CPF formatting to compare
      const normalizedCpf = cleanId.replace(/\D/g, '');
      if (normalizedCpf) {
        clientFound = db.getClientByCpf(normalizedCpf);
      }
    }

    if (!clientFound) {
      return { success: false, error: 'Usuário não cadastrado.' };
    }

    if (!clientFound.active) {
      return { success: false, error: 'Esta conta está temporariamente bloqueada. Contate o suporte.' };
    }

    // Simple mock password comparison (e.g. they typed anything, or check a simulated password. For ease, check if they typed a password length >= 4)
    if (password.length < 4) {
      return { success: false, error: 'Senha incorreta.' };
    }

    setClient(clientFound);
    setIsAdmin(false);
    db.setLoggedUser({ client: clientFound });
    db.addAuditLog(clientFound.id, clientFound.name, 'Client', 'LOGIN', 'Login de cliente efetuado com sucesso.');
    return { success: true };
  };

  const logout = () => {
    if (isAdmin) {
      db.addAuditLog('admin', 'Dr. Roberto Podólogo (Adm)', 'Admin', 'LOGOUT', 'Administrador efetuou logout.');
    } else if (client) {
      db.addAuditLog(client.id, client.name, 'Client', 'LOGOUT', 'Cliente efetuou logout.');
    }
    setClient(null);
    setIsAdmin(false);
    db.setLoggedUser(null);
  };

  const registerClient = (clientData: Omit<Client, 'id' | 'active' | 'createdAt'>) => {
    // Validate CPF uniqueness
    const normalizedCpf = clientData.cpf.replace(/\D/g, '');
    const existingCpf = db.getClientByCpf(normalizedCpf);
    if (existingCpf) {
      return { success: false, error: 'CPF já cadastrado. Por favor, faça login ou recupere sua senha.' };
    }

    // Validate Email uniqueness
    const existingEmail = db.getClientByEmail(clientData.email);
    if (existingEmail) {
      return { success: false, error: 'Este e-mail já está associado a outra conta.' };
    }

    // Create client
    const newClient: Client = {
      ...clientData,
      id: 'c' + Date.now(),
      active: true,
      createdAt: new Date().toISOString()
    };

    db.saveClient(newClient);
    db.addAuditLog(newClient.id, newClient.name, 'Client', 'REGISTER', 'Novo cadastro de cliente efetuado com sucesso.');

    // Log the user in automatically upon registration
    setClient(newClient);
    setIsAdmin(false);
    db.setLoggedUser({ client: newClient });

    return { success: true, client: newClient };
  };

  const updateProfile = (updatedClient: Client) => {
    // Check if email already exists on another client
    const existingEmail = db.getClientByEmail(updatedClient.email);
    if (existingEmail && existingEmail.id !== updatedClient.id) {
      return { success: false, error: 'Este e-mail já está em uso por outro cliente.' };
    }

    db.saveClient(updatedClient);
    setClient(updatedClient);
    db.setLoggedUser({ client: updatedClient });
    db.addAuditLog(updatedClient.id, updatedClient.name, 'Client', 'PROFILE_UPDATE', 'Dados cadastrais atualizados pelo cliente.');

    return { success: true };
  };

  const recoverPassword = (email: string) => {
    const clientFound = db.getClientByEmail(email);
    // If not found, return true anyway (security practice) but simulate the message
    if (!clientFound) {
      return { success: true, message: 'Se o e-mail informado estiver cadastrado, você receberá as instruções em breve.' };
    }

    db.addAuditLog(clientFound.id, clientFound.name, 'Client', 'PASSWORD_RECOVERY_REQUEST', 'Recuperação de senha solicitada via e-mail.');
    return { success: true, message: `Instruções de recuperação de senha enviadas para ${email}.` };
  };

  return (
    <AuthContext.Provider value={{ client, isAdmin, login, logout, registerClient, updateProfile, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
