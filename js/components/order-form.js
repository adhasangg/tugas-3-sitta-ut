Vue.component('order-form', function(resolve, reject) {
    ApiService.fetchTemplate('templates/order-form.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                props: {
                    trackingDb: {
                        type: Object,
                        required: true
                    }
                },
                data() {
                    return {
                        paketList: [],
                        stokList: [],
                        form: {
                            nim: '',
                            nama: '',
                            ekspedisi: 'JNE Regular',
                            paketKode: '',
                            tanggalKirim: ''
                        },
                        errors: {}
                    };
                },
                filters: {
                    currency(value) {
                        if (!value && value !== 0) return 'Rp 0';
                        return 'Rp ' + Number(value).toLocaleString('id-ID');
                    }
                },
                computed: {
                    generatedDoNumber() {
                        const year = new Date().getFullYear();
                        const prefix = `DO${year}-`;
                        
                        const matchNumbers = Object.keys(this.trackingDb)
                            .filter(key => key.toUpperCase().startsWith(prefix.toUpperCase()) || key.toUpperCase().startsWith(`DO2025-`))
                            .map(key => {
                                const parts = key.split('-');
                                if (parts.length < 2) return 0;
                                const seq = parseInt(parts[1], 10);
                                return isNaN(seq) ? 0 : seq;
                            });

                        const nextSeq = matchNumbers.length > 0 ? Math.max(...matchNumbers) + 1 : 1;
                        const seqStr = String(nextSeq).padStart(3, '0');
                        return `${prefix}${seqStr}`;
                    },
                    selectedPaketDetails() {
                        if (!this.form.paketKode) return null;
                        return this.paketList.find(p => p.kode === this.form.paketKode);
                    },
                    formTotalHarga() {
                        const p = this.selectedPaketDetails;
                        return p ? p.harga : 0;
                    }
                },
                async created() {
                    const data = await ApiService.fetchBahanAjar();
                    if (data) {
                        this.paketList = data.paket || [];
                        this.stokList = data.stok || [];
                    }
                    this.setDefaultDate();
                },
                methods: {
                    setDefaultDate() {
                        const today = new Date();
                        const yyyy = today.getFullYear();
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const dd = String(today.getDate()).padStart(2, '0');
                        this.form.tanggalKirim = `${yyyy}-${mm}-${dd}`;
                    },
                    validateForm() {
                        const errs = {};
                        if (!this.form.nim || this.form.nim.trim() === '') errs.nim = 'NIM mahasiswa wajib diisi';
                        else if (!/^\d+$/.test(this.form.nim.trim())) errs.nim = 'NIM harus berupa angka saja';

                        if (!this.form.nama || this.form.nama.trim() === '') errs.nama = 'Nama penerima wajib diisi';
                        if (!this.form.ekspedisi) errs.ekspedisi = 'Metode ekspedisi wajib dipilih';
                        if (!this.form.paketKode) errs.paketKode = 'Paket bahan ajar wajib dipilih';
                        if (!this.form.tanggalKirim) errs.tanggalKirim = 'Tanggal kirim wajib diisi';

                        this.errors = errs;
                        return Object.keys(errs).length === 0;
                    },
                    submitDO() {
                        if (!this.validateForm()) return;

                        const doNum = this.generatedDoNumber;
                        const newDo = {
                            nim: this.form.nim.trim(),
                            nama: this.form.nama.trim(),
                            status: 'Diproses (Baru)',
                            ekspedisi: this.form.ekspedisi,
                            tanggalKirim: this.form.tanggalKirim,
                            paket: this.form.paketKode,
                            total: this.formTotalHarga,
                            perjalanan: [
                                {
                                    waktu: new Date().toLocaleString('id-ID'),
                                    keterangan: `DO Dibuat. Pengirim: Universitas Terbuka. Penerima: ${this.form.nama.trim()}`
                                }
                            ]
                        };

                        this.$emit('submit-do', { doNum, newDo });
                    }
                }
            });
        })
        .catch(reject);
});
