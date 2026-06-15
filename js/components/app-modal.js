Vue.component('app-modal', function(resolve, reject) {
    ApiService.fetchTemplate('templates/app-modal.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                props: {
                    show: {
                        type: Boolean,
                        required: true
                    },
                    title: {
                        type: String,
                        default: ''
                    },
                    isAlert: {
                        type: Boolean,
                        default: false
                    },
                    alertType: {
                        type: String,
                        default: 'success'
                    },
                    dynamicContent: {
                        type: Boolean,
                        default: false
                    }
                }
            });
        })
        .catch(reject);
});
