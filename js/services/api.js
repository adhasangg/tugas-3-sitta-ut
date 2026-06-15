const ApiService = {
  async fetchBahanAjar() {
    try {
      const response = await axios.get("/api/dataBahanAjar");
      return response.data;
    } catch (error) {
      console.error("Error fetching data bahan ajar:", error);
      return null;
    }
  },

  async fetchUsers() {
    try {
      const response = await axios.get("/api/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return null;
    }
  },

  async fetchTemplate(path) {
    try {
      const response = await axios.get(path);
      return response.data;
    } catch (error) {
      console.error("Error fetching template:", error);
      return "<div>Error loading template</div>";
    }
  },

  async addStok(data) {
    try {
      const response = await axios.post("/api/stok", data);
      return response.data;
    } catch (error) {
      console.error("Error adding stok:", error);
      throw error;
    }
  },

  async updateStok(id, data) {
    try {
      const response = await axios.put(`/api/stok/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating stok:", error);
      throw error;
    }
  },

  async deleteStok(id) {
    try {
      const response = await axios.delete(`/api/stok/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting stok:", error);
      throw error;
    }
  },

  async registerUser(data) {
    try {
      const response = await axios.post("/api/register", data);
      return response.data;
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  },

  async forgotPassword(data) {
    try {
      const response = await axios.post("/api/forgot-password", data);
      return response.data;
    } catch (error) {
      console.error("Error forgot password:", error);
      throw error;
    }
  },

  async fetchTracking() {
    try {
      const response = await axios.get("/api/tracking");
      return response.data;
    } catch (error) {
      console.error("Error fetching tracking:", error);
      throw error;
    }
  },

  async createTracking(data) {
    try {
      const response = await axios.post("/api/tracking", data);
      return response.data;
    } catch (error) {
      console.error("Error creating tracking:", error);
      throw error;
    }
  },
};

window.ApiService = ApiService;
