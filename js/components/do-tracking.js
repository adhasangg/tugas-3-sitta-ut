Vue.component('do-tracking', function(resolve, reject) {
    ApiService.fetchTemplate('templates/do-tracking.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                data() {
                    return {
                        trackingDb: {},
                        searchDoNumber: '',
                        searchedDoResult: null,
                        searchPerformed: false,
                        showAddDoModal: false
                    };
                },
                filters: {
                    currency(value) {
                        if (!value && value !== 0) return 'Rp 0';
                        return 'Rp ' + Number(value).toLocaleString('id-ID');
                    }
                },
                watch: {
                    searchDoNumber(newVal) {
                        if (!newVal || newVal.trim() === '') {
                            this.resetSearch();
                        }
                    }
                },
                async created() {
                    this.$root.isLoading = true;
                    try {
                        const trackingData = await ApiService.fetchTracking();
                        // Transform array to object mapped by nomorDO
                        this.trackingDb = trackingData.reduce((acc, curr) => {
                            acc[curr.nomorDO] = curr;
                            return acc;
                        }, {});
                    } catch (error) {
                        console.error('Failed fetching tracking', error);
                        this.trackingDb = {};
                    } finally {
                        this.$root.isLoading = false;
                    }
                },
                methods: {
                    resetSearch() {
                        this.searchDoNumber = '';
                        this.searchPerformed = false;
                        this.searchedDoResult = null;
                    },
                    performSearch() {
                        const query = this.searchDoNumber.trim().toUpperCase();
                        this.searchPerformed = true;
                        
                        if (!query) {
                            this.searchedDoResult = null;
                            return;
                        }

                        const normalizedQuery = query.replace('DO', '').replace('-', '');
                        const queryNum = parseInt(normalizedQuery, 10);

                        const foundKey = Object.keys(this.trackingDb).find(key => {
                            if (key.toUpperCase() === query) return true;
                            const normalizedKey = key.toUpperCase().replace('DO', '').replace('-', '');
                            const keyNum = parseInt(normalizedKey, 10);
                            return !isNaN(queryNum) && !isNaN(keyNum) && queryNum === keyNum;
                        });

                        if (foundKey) {
                            this.searchedDoResult = {
                                nomorDO: foundKey,
                                ...this.trackingDb[foundKey]
                            };
                        } else {
                            this.searchedDoResult = null;
                        }
                    },
                    async handleNewDo({ doNum, newDo }) {
                        this.$root.isLoading = true;
                        try {
                            const payload = {
                                nomorDO: doNum,
                                ...newDo
                            };
                            await ApiService.createTracking(payload);
                            this.showAddDoModal = false;
                            
                            // Re-fetch tracking to ensure UI is up-to-date
                            const trackingData = await ApiService.fetchTracking();
                            this.trackingDb = trackingData.reduce((acc, curr) => {
                                acc[curr.nomorDO] = curr;
                                return acc;
                            }, {});

                            this.searchDoNumber = doNum;
                            this.performSearch();

                            this.$emit('notify', {
                                title: 'Berhasil',
                                message: `Delivery Order ${doNum} berhasil ditambahkan!`,
                                type: 'success'
                            });
                        } catch (error) {
                            this.$emit('notify', {
                                title: 'Gagal Menambahkan DO',
                                message: error.response?.data?.message || 'Terjadi kesalahan saat memproses pesanan.',
                                type: 'error'
                            });
                        } finally {
                            this.$root.isLoading = false;
                        }
                    }
                }
            });
        })
        .catch(reject);
});
