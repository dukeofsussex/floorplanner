<template>
    <div id="editor">
        <div ref="toolbarContainer">
            <span class="ql-formats">
                <select class="ql-header" />
            </span>
            <span class="ql-formats">
                <button class="ql-bold" />
                <button class="ql-italic" />
                <button class="ql-underline" />
                <button class="ql-strike" />
                <button class="ql-code" />
            </span>
            <span class="ql-formats">
                <select class="ql-color" />
                <select class="ql-background" />
            </span>
            <span v-if="!minimal"
                  class="ql-formats">
                <button class="ql-blockquote" />
                <button class="ql-code-block" />
            </span>
            <span class="ql-formats">
                <button class="ql-list"
                        value="ordered" />
                <button class="ql-list"
                        value="bullet" />
                <button v-if="!minimal"
                        class="ql-indent"
                        value="-1" />
                <button v-if="!minimal"
                        class="ql-indent"
                        value="+1" />
            </span>
            <span class="ql-formats">
                <button class="ql-direction"
                        value="rtl" />
                <select class="ql-align" />
            </span>
            <span class="ql-formats">
                <button v-if="!minimal"
                        class="ql-link" />
                <button class="ql-image" />
                <button v-if="!minimal"
                        class="ql-video" />
            </span>
            <span class="ql-formats">
                <button class="ql-clean" />
            </span>
        </div>
        <div ref="editorContainer" />
    </div>
</template>

<script lang="ts">
    import {
        Component,
        Prop,
        Vue,
        Watch,
    } from 'vue-property-decorator';
    import Quill from 'quill';

    @Component
    export default class Editor extends Vue {
        @Prop({ default: '' }) readonly value!: string;

        @Prop({ default: false }) readonly minimal!: boolean;

        editor!: Quill;

        // TODO Embed image from link
        mounted() {
            this.editor = new Quill(this.$refs.editorContainer as HTMLElement, {
                modules: {
                    toolbar: this.$refs.toolbarContainer,
                },
                placeholder: 'Describe the area',
                theme: 'snow',
            });

            this.editor.root.innerHTML = this.value;

            // We will add the update event here
            this.editor.on('text-change', () => this.update);
        }

        @Watch('value')
        updateText() {
            this.editor.root.innerHTML = this.value;
        }

        update() {
            this.$emit('input', this.editor.getLength() > 1 ? this.editor.root.innerHTML : '');
        }
    }
</script>

<style lang="scss" scoped>
    @import "~quill/dist/quill.snow.css"
</style>
