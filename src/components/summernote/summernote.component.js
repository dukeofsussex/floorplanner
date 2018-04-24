export default {
    name: 'summernote',
    props: {
        id: String,
        content: {
            default: '',
            type: String,
        },
        height: {
            default: null,
            type: Number,
        },
        toolbar: {
            default: null,
            type: Array,
        },
        onBlur: Function,
    },
    mounted: function () {
        const options = {
            height: this.height,
            focus: false,
            callbacks: {
                onBlur: (evt) => this.onBlur(this.id, $(this.$refs.summernote).summernote('code'), evt)
            },
        };

        if (this.toolbar) {
            options.toolbar = this.toolbar;
        }

        $(this.$refs.summernote).summernote(options);
        $(this.$refs.summernote).summernote('code', this.content);
    },
    beforeDestroy: function () {
        $(this.$refs.summernote).summernote('destroy');
    },
    watch: {
        content: function (content) {
            $(this.$refs.summernote).summernote('code', content);
        }
    },
}
