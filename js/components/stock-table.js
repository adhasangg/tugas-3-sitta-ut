Vue.component('ba-stock-table', function(resolve, reject) {
    ApiService.fetchTemplate('templates/stock-table.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                data() {
                    return {
                        stok: [],
                        upbjjList: [],
                        kategoriList: [],
                        selectedUpbjj: '',
                        selectedKategori: '',
                        showWarningOnly: false,
                        sortBy: 'judul',
                        sortOrder: 'asc',
                        showModal: false,
                        modalType: 'add',
                        editIndex: -1,
                        form: {
                            kode: '',
                            judul: '',
                            kategori: '',
                            upbjj: '',
                            lokasiRak: '',
                            harga: 0,
                            qty: 0,
                            safety: 0,
                            catatanHTML: ''
                        },
                        errors: {},
                        triggerFetch: 0
                    };
                },
                filters: {
                    currency(value) {
                        if (!value && value !== 0) return 'Rp 0';
                        return 'Rp ' + Number(value).toLocaleString('id-ID');
                    }
                },
                computed: {
                    filteredAndSortedStok() {
                        let result = [...this.stok];

                        if (this.selectedUpbjj) {
                            result = result.filter(item => item.upbjj === this.selectedUpbjj);
                        }

                        if (this.selectedKategori) {
                            result = result.filter(item => item.kategori === this.selectedKategori);
                        }

                        if (this.showWarningOnly) {
                            result = result.filter(item => item.qty < item.safety || item.qty === 0);
                        }

                        result.sort((a, b) => {
                            let valA = a[this.sortBy];
                            let valB = b[this.sortBy];

                            if (typeof valA === 'string') {
                                valA = valA.toLowerCase();
                                valB = valB.toLowerCase();
                            }

                            if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
                            if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
                            return 0;
                        });

                        return result;
                    }
                },
                watch: {
                    selectedUpbjj(newVal) {
                        if (!newVal) {
                            this.selectedKategori = '';
                        }
                    },
                    triggerFetch() {
                        this.loadData();
                    }
                },
                created() {
                    this.triggerFetch++;
                },
                methods: {
                    async loadData() {
                        this.$root.isLoading = true;
                        try {
                            const data = await ApiService.fetchBahanAjar();
                            if (data) {
                                this.upbjjList = data.upbjjList || [];
                                this.kategoriList = data.kategoriList || [];
                                this.stok = data.stok || [];
                            }
                        } finally {
                            this.$root.isLoading = false;
                        }
                    },
                    resetFilters() {
                        this.selectedUpbjj = '';
                        this.selectedKategori = '';
                        this.showWarningOnly = false;
                        this.sortBy = 'judul';
                        this.sortOrder = 'asc';
                    },
                    toggleSort(field) {
                        if (this.sortBy === field) {
                            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                        } else {
                            this.sortBy = field;
                            this.sortOrder = 'asc';
                        }
                    },
                    openAddModal() {
                        this.modalType = 'add';
                        this.editIndex = -1;
                        this.form = { kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: '' };
                        this.errors = {};
                        this.showModal = true;
                    },
                    openEditModal(item) {
                        this.modalType = 'edit';
                        this.editIndex = this.stok.findIndex(s => s.kode === item.kode);
                        this.form = { ...item };
                        this.errors = {};
                        this.showModal = true;
                    },
                    validateForm() {
                        const errs = {};
                        if (!this.form.kode || this.form.kode.trim() === '') errs.kode = 'Kode wajib diisi';
                        else if (!/^[A-Z]{4,5}\d{4}$/.test(this.form.kode.trim())) errs.kode = 'Format kode tidak valid (contoh: EKMA4116)';
                        else if (this.modalType === 'add' && this.stok.some(s => s.kode === this.form.kode.trim())) errs.kode = 'Kode sudah terdaftar';

                        if (!this.form.judul || this.form.judul.trim() === '') errs.judul = 'Judul wajib diisi';
                        if (!this.form.kategori) errs.kategori = 'Kategori wajib dipilih';
                        if (!this.form.upbjj) errs.upbjj = 'UT-Daerah wajib dipilih';
                        if (!this.form.lokasiRak || this.form.lokasiRak.trim() === '') errs.lokasiRak = 'Lokasi rak wajib diisi';
                        if (this.form.harga === undefined || this.form.harga < 0) errs.harga = 'Harga harus >= 0';
                        if (this.form.qty === undefined || this.form.qty < 0) errs.qty = 'Stok harus >= 0';
                        if (this.form.safety === undefined || this.form.safety < 0) errs.safety = 'Safety stok harus >= 0';

                        this.errors = errs;
                        return Object.keys(errs).length === 0;
                    },
                    async submitForm() {
                        if (!this.validateForm()) return;
                        
                        const itemData = {
                            kode: this.form.kode.trim(),
                            judul: this.form.judul.trim(),
                            kategori: this.form.kategori,
                            upbjj: this.form.upbjj,
                            lokasiRak: this.form.lokasiRak.trim(),
                            harga: Number(this.form.harga),
                            qty: Number(this.form.qty),
                            safety: Number(this.form.safety),
                            catatanHTML: this.form.catatanHTML.trim()
                        };

                        try {
                            this.$root.isLoading = true;
                            if (this.modalType === 'add') {
                                const response = await ApiService.addStok(itemData);
                                itemData.id = response.id;
                                this.stok.push(itemData);
                            } else {
                                await ApiService.updateStok(this.form.id, itemData);
                                itemData.id = this.form.id;
                                this.$set(this.stok, this.editIndex, itemData);
                            }

                            this.showModal = false;
                            this.$emit('notify', {
                                title: 'Berhasil',
                                message: this.modalType === 'add' ? 'Data stok berhasil ditambahkan!' : 'Data stok berhasil diperbarui!',
                                type: 'success'
                            });
                        } catch(err) {
                            this.$emit('notify', { title: 'Gagal', message: 'Terjadi kesalahan pada server', type: 'error' });
                        } finally {
                            this.$root.isLoading = false;
                        }
                    },
                    deleteItem(item) {
                        this.$emit('confirm', {
                            title: 'Konfirmasi Hapus',
                            message: `Yakin ingin menghapus data dengan kode ${item.kode}?`,
                            callback: async (confirmed) => {
                                if (confirmed) {
                                    this.$root.isLoading = true;
                                    try {
                                        await ApiService.deleteStok(item.id);
                                        this.stok = this.stok.filter(s => s.id !== item.id);
                                        this.$emit('notify', { title: 'Berhasil', message: 'Data berhasil dihapus.', type: 'success' });
                                    } catch(err) {
                                        this.$emit('notify', { title: 'Gagal', message: 'Gagal menghapus data', type: 'error' });
                                    } finally {
                                        this.$root.isLoading = false;
                                    }
                                }
                            }
                        });
                    }
                }
            });
        })
        .catch(reject);
});
