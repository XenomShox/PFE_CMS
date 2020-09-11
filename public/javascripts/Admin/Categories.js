(()=>{
   class Categories{
       opened;
       dashboard;
       data;
       constructor(selector) {
           this.opened=[];
           this.data=null;
           this.Refresh()
                .then(()=>{
                    selector.removeClass("is-loading is-loading-secondary is-loading-lg");
                    this.data.forEach((category) => {
                        let name=$(`<span>${category.Name}</span>`),
                            li=$(`<li class="rounded p-1 role-permission-button d-flex justify-content-between align-items-center"></li>`);
                        selector.find(".roles-list").append( li.append(name)
                            .append($(`<i class="far fa-trash-alt"></i>`).on('click',this.DeleteCategory(category,li)))
                            .on("click",this.Open(category,name))
                        );
                    });
                })
           $(".add-role-button").click(()=>{
               let category={
                        Name:"Category",
                        Slug:"/Categories/",
                        Cover:"",
                        Description:"",
                        _id:null
                   },
                   name=$(`<span>${category.Name}</span>`),
                   li=$(`<li class="rounded p-1 role-permission-button d-flex justify-content-between align-items-center"></li>`);
               selector.find(".roles-list").append( li.append(name)
                   .append($(`<i class="far fa-trash-alt"></i>`).on('click',this.DeleteCategory(category,li)))
                   .on("click",this.Open(category,name))
               );

           })
           this.dashboard=$(".role-permission-list");
       }
       Refresh(){
           return $.ajax("/Categories/?f=true",{method:"GET"})
               .then(data=>{ this.data=data; })
               .catch(reason => {
                   $.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});
               })
       }
       Open(category,name){
           let $this=this;
            return function (e){
                let parents="";
                $this.data.forEach(cat=>{
                    let per=category.Slug.replace(/[^/]+$/,"");
                    if(cat._id!==category._id) parents+=`<option value="${cat.Slug}/" ${(cat.Slug+"/")===per?"selected":""}>${cat.Name}</option>`;
                })
                $this.dashboard.empty()
                    .append(`
                        <div>
                            <h5 class="text-muted font-weight-bold">Category name</h5>
                            <input name="Name" type="text" placeholder="Owner" class="form-control" value="${category.Name}" required>
                        </div>
                        <hr class="my-3">
                        <div>
                            <h5 class="text-muted font-weight-bold">Category Cover</h5>
                            <input name="Cover" type="text" placeholder="Select / Upload a cover for the category" class="form-control" value="${category.Cover?category.Cover:""}" selector-file="Image">
                        </div>
                        <hr class="my-3">
                        <h5 class="text-muted font-weight-bold">Category Slug</h5>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <select class="form-control border-right-0" name="SlugP">
                                    <option value="/Categories/">~Parent Category~</option>                     
                                    ${parents}                     
                                </select>
                            </div>
                            <input name="Slug" type="text" placeholder="Add Description" class="form-control  border-left-0" value="${category.Slug.replace(/^(\/[^/]*)+\//,"")}" required>
                        </div>
                        <hr class="my-3"
                        <div >
                            <h5 class="text-muted font-weight-bold">Category Description</h5>
                            <textarea name="Description" placeholder="Add Description" class="form-control" required>${category.Description}</textarea>
                        </div>
                `)
                    .append($('<button class="btn btn-border btn-success text-center mt-3 ml-auto">Save</button>')
                    .on('click',()=>{
                        let promise,valid={condition:true,text:""};
                        $this.dashboard.find('[name]').each((i,elm)=>{
                            if(elm.name!=="Cover" && !$(elm).is(":valid")){
                                valid.condition=false;
                                valid.text+=elm.name+" ";
                            }
                            category[elm.name]=$(elm).val()
                        })
                        category.Slug=category.SlugP+category.Slug;
                        delete category.SlugP;
                        if(!valid.condition) return $.notify( { message: "this Category isn't valid : "+valid.text } , { type: 'danger' , placement : {from:"bottom"} } )
                        if(!category._id) {
                            let {_id,...data}=category
                            promise = $.ajax('/categories',{method:"POST",data})
                        }
                        else promise = $.ajax(`/categories?id=${category._id}`,{method:"PUT",data:category})
                        promise
                            .then(Data=>{
                                name.text(category.Name);
                                if(!category._id) category._id=Data.id;
                                $this.Refresh();
                                $.notify({message: Data.message},{type: 'success',placement:{from:"bottom"}})
                            })
                            .catch(reason => { $.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}}) })
                    }));
                $this.dashboard.find("[name=Cover]").FileSelector({ url: "/files/" });
            }
       }
       Close(){ this.dashboard.empty(); }
       DeleteCategory(category,selector){
           let $this=this
           return function (e){
               console.log(this,category._id);
               if(category._id) $.ajax("/Categories?id="+category._id,{method:"DELETE"})
                   .then(data=>{
                        selector.remove();
                        $this.Refresh();
                        $this.Close();
                       $.notify({message: data},{type: 'success',placement:{from:"bottom"}})
                   })
                   .catch(reason => {$.notify({message: reason.responseText},{type: 'danger',placement:{from:"bottom"}});})
               else {
                   selector.remove();
                   $this.Close();
               }
               e.preventDefault();
               return false;
           }
       }
   }
    new Categories($("#Categories"));
})()