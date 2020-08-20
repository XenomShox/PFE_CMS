(()=>{
    $("#KeyWords").tagsinput({
        confirmKeys: [9, 32]
    });
    class FileSelector{
        #Tab
        #Selectors;
        constructor(){
            $("body").append(this.#Tab=$(`<div class="modal FileSelector fade" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header  navbar align-items-center">
                                <ul class="navbar-nav flex-row">
                                    <div class="nav-item active">
                                        <a href="#" class="nav-link Select"><span class="fas fa-folder fa-lg mr-1"></span>Select File</a>
                                    </div>
                                    <div class="nav-item">
                                        <a href="#" class="nav-link Upload"><span class="fa fa-upload fa-lg mr-1"></span>Upload File</a>
                                    </div>
                                </ul>
            
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true" class="text-white">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class=""></div>
                                <div></div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>`));
            $("[selector-file]").each((index,elem)=>{

            });
        }
        ShowTab(){this.#Tab.modal("show");}

    }
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
            this.#Form.find("input[name],select[name]").each((index,element)=>{ Data[element.name]=$(element).val();})
            return Data;
        }
    }
    $.fn.FormAjax=function(){return new FormAjax(this);}
    $.fn.FileSelector=function(FilesType){return new FileSelector(this,FilesType);}
})();
$("#Settings form").FormAjax();
$("#Settings form .File-Selector").FileSelector("Image");