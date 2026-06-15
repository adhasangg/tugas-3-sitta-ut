Vue.component('status-badge', function(resolve, reject) {
    ApiService.fetchTemplate('templates/status-badge.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                props: {
                    qty: {
                        type: Number,
                        required: true
                    },
                    safety: {
                        type: Number,
                        required: true
                    }
                },
                computed: {
                    statusInfo() {
                        if (this.qty === 0) {
                            return { text: 'Kosong', class: 'status-kosong', icon: '🔴' };
                        } else if (this.qty < this.safety) {
                            return { text: 'Menipis', class: 'status-menipis', icon: '🟡' };
                        } else {
                            return { text: 'Aman', class: 'status-aman', icon: '🟢' };
                        }
                    },
                    statusClass() {
                        return this.statusInfo.class;
                    },
                    icon() {
                        return this.statusInfo.icon;
                    },
                    text() {
                        return this.statusInfo.text;
                    }
                }
            });
        })
        .catch(reject);
});
