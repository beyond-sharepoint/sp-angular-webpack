class FormLibrary {
    static async getFormLibrary($spContext, settings) {

        //Create a new SPContext and verify the specified location
        await $spContext.ensureContext();

        $spContext.fetch({
            
        });
    }
}

export default FormLibrary;