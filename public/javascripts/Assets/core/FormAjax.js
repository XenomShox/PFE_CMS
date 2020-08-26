(()=>{
    class FormAjax{
        #Form;
        constructor(form) {
            this.#Form=form.submit((e)=>{
                e.preventDefault();
                this.SendData(this.CatchValues());
            });
        }
        SendData(Data){
            $.ajax(this.#Form.attr('action'),{
                data:Data,
                method:"POST",
                timeout:0
            })
                .then((data)=>{
                    $.notify({message: data,},{type: 'success',placement:{from:"bottom"}});
                })
                .catch(reason =>{
                    $.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});
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
    $.fn.FormAjax=function(){return new FormAjax(this);}
})()