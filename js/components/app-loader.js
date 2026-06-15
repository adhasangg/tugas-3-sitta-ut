Vue.component('app-loader', function(resolve, reject) {
    ApiService.fetchTemplate('templates/app-loader.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                props: {
                    show: {
                        type: Boolean,
                        default: false
                    }
                }
            });
        })
        .catch(reject);
});
