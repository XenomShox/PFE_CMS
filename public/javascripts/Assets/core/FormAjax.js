(()=>{
    class FormAjax{
        #Form;
        constructor(form,success,fail) {
            this.#Form=form.submit((e)=>{
                e.preventDefault();
                this.SendData(this.CatchValues(),success,fail);
            });
        }
        SendData(Data,success,fail){
            $.ajax(this.#Form.attr('action'),{
                data:Data,
                method:this.#Form.attr('method').toUpperCase(),
                timeout:0
            })
                .then((data)=>{
                    $.notify({message: data,},{type: 'success',placement:{from:"bottom"}});
                    if(success) success();
                })
                .catch(reason =>{
                    $.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});
                    if(fail) fail();
                })
        }
        CatchValues(){
            let Data={}
            this.#Form.find("input[name],select[name],textarea[name]").each((index,element)=>{
                if(element.type==="checkbox") Data[element.name]=Boolean($(element).is(':checked'));
                else Data[element.name]=$(element).val();
            })
            return Data;
        }
    }
    $.fn.FormAjax=function(success,fail){return new FormAjax(this,success,fail);}
})()