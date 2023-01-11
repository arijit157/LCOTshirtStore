//base - Product.find({ rating : {$gte: 4}, })
//full URL - localhost:4000/api/v1/filter?search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5
//bigQ - search=coder&page=2&category=shortsleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5


class WhereClause{
    constructor(base, bigQ){
        this.base=base;   //'this' refers to the current object i.e. products
        this.bigQ=bigQ;
    }

    //for searching a particular product
    //bigQ is an object here

    search(){
        const searchWord=this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                options: "i"
            } 
        } : {}

        this.base=this.base.find({...searchWord});
        return this;
    }

    //for applying less than or greater than filter
    filter(){
        let copyQ={...this.bigQ};   //copyQ is an object (here we are copying the bigQ object)

        delete copyQ["search"];  //delete is used to delete any property of an object
        delete copyQ["limit"];
        delete copyQ["page"];

        let stringOfCopyQ=JSON.stringify(copyQ);  //object to JSON string

        stringOfCopyQ=stringOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, (m)=>`$${m}`);  

        let jsonOfCopyQ=JSON.parse(stringOfCopyQ);   //JSON to object

        //console.log(jsonOfCopyQ);

        this.base=this.base.find(jsonOfCopyQ);

        //this.base=this.base.find({...jsonOfCopyQ});

        return this;
    }

    //for pagination
    pager(resultPerPage){
        let currentPage=1;

        if(this.bigQ.page){

            currentPage=this.bigQ.page;
        }

        let skipVal=resultPerPage*(currentPage-1);

        this.base=this.base.limit(resultPerPage).skip(skipVal);

        return this;
    }

}

module.exports=WhereClause;