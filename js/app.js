new Vue({
    el: '#app',
    data() {
        let savedUser = null;
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('user_v2');
            if (saved) {
                try {
                    savedUser = JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved user", e);
                }
            }
        }

        return {
            isLoading: false,
            users: [],
            currentTab: window.location.hash.replace('#', '') || 'home',
            email: '',
            password: '',
            loginError: '',
            showForgotPasswordBtn: false,
            loggedInUser: savedUser,
            greeting: '',
            showRegisterModal: false,
            showResetModal: false,
            resetEmail: '',
            resetEmailError: false,
            register: {
                nama: '',
                email: '',
                password: '',
                role: 'UPBJJ-UT',
                lokasi: ''
            },
            registerEmailError: false,
            
            // Global Alert State
            alertActive: false,
            alertTitle: '',
            alertMessage: '',
            alertType: 'success',
            alertCallback: null
        };
    },
    async created() {
        // Fetch users data
        const usersData = await ApiService.fetchUsers();
        if (usersData) {
            this.users = usersData;
        }
    },
    mounted() {
        this.updateGreeting();
        setInterval(this.updateGreeting, 60000);
        this.syncHash();
        window.addEventListener('hashchange', this.syncHash);
    },
    destroyed() {
        window.removeEventListener('hashchange', this.syncHash);
    },
    methods: {
        syncHash() {
            const hash = window.location.hash.replace('#', '') || 'home';
            if (['home', 'stok', 'tracking'].includes(hash)) {
                this.currentTab = hash;
            } else {
                window.location.hash = 'home';
                this.currentTab = 'home';
            }
        },
        updateGreeting() {
            const hour = new Date().getHours();
            if (hour >= 4 && hour < 10) {
                this.greeting = "Selamat Pagi";
            } else if (hour >= 10 && hour < 15) {
                this.greeting = "Selamat Siang";
            } else if (hour >= 15 && hour < 18) {
                this.greeting = "Selamat Sore";
            } else {
                this.greeting = "Selamat Malam";
            }
        },
        async handleLogin() {
            this.loginError = '';
            const emailQuery = this.email.trim();
            const passwordQuery = this.password;

            try {
                const response = await axios.post('/api/login', {
                    email: emailQuery,
                    password: passwordQuery
                });
                
                const { token, user } = response.data;
                
                if (user) {
                    this.loggedInUser = user;
                    localStorage.setItem('sitta_token', token);
                    localStorage.setItem('user_v2', JSON.stringify(user));
                    this.email = '';
                    this.password = '';
                    this.showForgotPasswordBtn = false;
                    this.currentTab = 'home';
                    window.location.hash = 'home';
                    this.triggerAlert('Login Berhasil', `Selamat datang kembali, ${user.nama}!`, 'success');
                }
            } catch (error) {
                this.loginError = 'Email atau password salah.';
                this.showForgotPasswordBtn = true;
                this.triggerAlert('Login Gagal', 'Email atau password salah.', 'error');
            }
        },
        handleLogout() {
            this.loggedInUser = null;
            this.currentTab = 'home';
            localStorage.removeItem('user_v2');
            this.triggerAlert('Logout', 'Anda telah keluar dari sistem.', 'success');
        },
        openResetModal() {
            this.resetEmail = '';
            this.resetEmailError = false;
            this.showResetModal = true;
        },
        async handleResetPassword() {
            this.resetEmailError = false;
            const emailQuery = this.resetEmail.trim();

            try {
                this.isLoading = true;
                const response = await ApiService.forgotPassword({ email: emailQuery });
                this.triggerAlert('Reset Password', response.message, 'success');
                this.showResetModal = false;
            } catch (error) {
                this.resetEmailError = true;
                this.triggerAlert('Reset Gagal', error.response?.data?.message || 'Email tidak ditemukan.', 'error');
            } finally {
                this.isLoading = false;
            }
        },
        openRegisterModal() {
            this.register = {
                nama: '',
                email: '',
                password: '',
                role: 'UPBJJ-UT',
                lokasi: ''
            };
            this.registerEmailError = false;
            this.showRegisterModal = true;
        },
        async handleRegister() {
            this.registerEmailError = false;
            const emailQuery = this.register.email.trim();

            const newUser = {
                nama: this.register.nama.trim(),
                email: emailQuery,
                password: this.register.password,
                role: this.register.role,
                lokasi: this.register.lokasi.trim()
            };

            try {
                this.isLoading = true;
                await ApiService.registerUser(newUser);
                this.showRegisterModal = false;
                this.triggerAlert('Registrasi Berhasil', `Registrasi berhasil! Silakan login menggunakan akun ${newUser.email}`, 'success');
            } catch (error) {
                this.registerEmailError = true;
                this.triggerAlert('Registrasi Gagal', error.response?.data?.message || 'Gagal melakukan registrasi.', 'error');
            } finally {
                this.isLoading = false;
            }
        },
        
        // Notification Methods (accessible from children via emit)
        handleNotification(payload) {
            this.triggerAlert(payload.title, payload.message, payload.type);
        },
        handleConfirm(payload) {
            this.triggerConfirmAlert(payload.title, payload.message, payload.callback);
        },
        triggerAlert(title, message, type = 'success') {
            this.alertActive = true;
            this.alertTitle = title;
            this.alertMessage = message;
            this.alertType = type;
            this.alertCallback = null;
        },
        triggerConfirmAlert(title, message, callback) {
            this.alertActive = true;
            this.alertTitle = title;
            this.alertMessage = message;
            this.alertType = 'confirm';
            this.alertCallback = callback;
        },
        closeAlert(confirmed) {
            this.alertActive = false;
            if (this.alertCallback) {
                this.alertCallback(confirmed);
            }
        }
    }
});
