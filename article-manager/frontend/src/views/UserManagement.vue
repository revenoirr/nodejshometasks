<template>
  <div class="user-management">
    <div class="page-header">
      <h2>👥 User Management</h2>
      <div class="stats">
        <div class="stat-card">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">Total Users</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.admins }}</span>
          <span class="stat-label">Admins</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats.regularUsers }}</span>
          <span class="stat-label">Regular Users</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading users...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else class="users-table">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <span class="user-email">{{ user.email }}</span>
              <span v-if="user.id === currentUserId" class="badge badge-self">You</span>
            </td>
            <td>{{ user.name || '-' }}</td>
            <td>
              <span :class="['role-badge', `role-${user.role}`]">
                {{ user.role }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>
              <div class="actions">
                <button
                  v-if="user.id !== currentUserId"
                  @click="openRoleModal(user)"
                  class="btn-change-role"
                  :disabled="updatingUserId === user.id"
                >
                  {{ updatingUserId === user.id ? 'Updating...' : 'Change Role' }}
                </button>
                <span v-else class="text-muted">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showRoleModal" class="modal-overlay" @click="closeRoleModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Change User Role</h3>
          <button @click="closeRoleModal" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <p><strong>User:</strong> {{ selectedUser.email }}</p>
          <p><strong>Current Role:</strong> <span :class="`role-${selectedUser.role}`">{{ selectedUser.role }}</span></p>
          
          <div class="role-selection">
            <label>
              <input 
                type="radio" 
                v-model="newRole" 
                value="user"
              />
              <span class="role-option">
                <span class="role-badge role-user">user</span>
                <span class="role-description">Regular user - can only edit own articles</span>
              </span>
            </label>
            
            <label>
              <input 
                type="radio" 
                v-model="newRole" 
                value="admin"
              />
              <span class="role-option">
                <span class="role-badge role-admin">admin</span>
                <span class="role-description">Administrator - can edit any article and manage users</span>
              </span>
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeRoleModal" class="btn-cancel">Cancel</button>
          <button 
            @click="updateRole" 
            class="btn-confirm"
            :disabled="!newRole || newRole === selectedUser.role"
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/authService';

const API_URL = 'http://localhost:3000';

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      stats: {
        total: 0,
        admins: 0,
        regularUsers: 0
      },
      loading: false,
      error: null,
      currentUserId: null,
      showRoleModal: false,
      selectedUser: null,
      newRole: null,
      updatingUserId: null
    };
  },
  mounted() {
    const user = authService.getUser();
    this.currentUserId = user?.id;
    
    this.fetchUsers();
    this.fetchStats();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: authService.getAuthHeader()
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Access denied. Admin privileges required.');
          }
          throw new Error('Failed to fetch users');
        }
        
        this.users = await response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchStats() {
      try {
        const response = await fetch(`${API_URL}/users/stats`, {
          headers: authService.getAuthHeader()
        });
        
        if (response.ok) {
          this.stats = await response.json();
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    },
    
    openRoleModal(user) {
      this.selectedUser = user;
      this.newRole = user.role;
      this.showRoleModal = true;
    },
    
    closeRoleModal() {
      this.showRoleModal = false;
      this.selectedUser = null;
      this.newRole = null;
    },
    
    async updateRole() {
      if (!this.newRole || this.newRole === this.selectedUser.role) {
        return;
      }
      
      this.updatingUserId = this.selectedUser.id;
      
      try {
        const response = await fetch(`${API_URL}/users/${this.selectedUser.id}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authService.getAuthHeader()
          },
          body: JSON.stringify({ role: this.newRole })
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update role');
        }
        
        const data = await response.json();
        
        const userIndex = this.users.findIndex(u => u.id === this.selectedUser.id);
        if (userIndex !== -1) {
          this.users[userIndex].role = data.user.role;
        }
        
        this.fetchStats();
        
        this.closeRoleModal();
        
        this.$emit('show-alert', `Role updated to ${data.user.role} successfully`, 'success');
      } catch (error) {
        console.error('Error updating role:', error);
        this.error = error.message;
        
        setTimeout(() => {
          this.error = null;
        }, 5000);
      } finally {
        this.updatingUserId = null;
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
};
</script>

<style scoped>
.user-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  margin-bottom: 20px;
  color: #333;
}

.stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.users-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

tbody tr {
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

tbody tr:hover {
  background: #f8f9fa;
}

td {
  padding: 15px;
  color: #495057;
}

.user-email {
  font-weight: 500;
  color: #212529;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 8px;
}

.badge-self {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.role-admin {
  background: #ffd54f;
  color: #f57f17;
}

.role-user {
  background: #e0e0e0;
  color: #616161;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-change-role {
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-change-role:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-change-role:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.text-muted {
  color: #adb5bd;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #adb5bd;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  line-height: 1;
}

.btn-close:hover {
  color: #495057;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin-bottom: 15px;
  color: #495057;
}

.role-selection {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.role-selection label {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.role-selection label:hover {
  border-color: #667eea;
  background: #f8f9fa;
}

.role-selection input[type="radio"] {
  margin-top: 4px;
  margin-right: 12px;
  cursor: pointer;
}

.role-option {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.role-description {
  font-size: 0.85rem;
  color: #6c757d;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel {
  background: #e9ecef;
  color: #495057;
}

.btn-cancel:hover {
  background: #dee2e6;
}

.btn-confirm {
  background: #667eea;
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
  }
  
  .users-table {
    overflow-x: auto;
  }
  
  table {
    min-width: 600px;
  }
}
</style>