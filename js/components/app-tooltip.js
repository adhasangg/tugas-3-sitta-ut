Vue.component('app-tooltip', function(resolve, reject) {
    ApiService.fetchTemplate('templates/app-tooltip.html')
        .then(templateStr => {
            resolve({
                template: templateStr,
                props: ['content'],
                data() {
                    return {
                        visible: false
                    };
                },
                methods: {
                    show() {
                        this.visible = true;
                    },
                    hide() {
                        this.visible = false;
                    }
                }
            });
        })
        .catch(reject);
});
