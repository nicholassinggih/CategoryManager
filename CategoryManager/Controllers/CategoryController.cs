using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using CategoryManager.Models;
using CategoryManager.Services;

namespace CategoryManager.Controllers
{
    public class CategoryController : ApiController
    {
        private CategoryRepository categoryRepository;

        public CategoryController()
        {
            this.categoryRepository = new CategoryRepository();
        }

        public Category[] Get()
        {
            return this.categoryRepository.GetCategoriesTree();
        }

        public Category Get(int id)
        {
            return this.categoryRepository.Get(id);
        }

        public void Post(Category category)
        {
            this.categoryRepository.Save(category);
        }

        public void Put(int id, Category category)
        {
            this.categoryRepository.Save(category);
        }

        public void Delete(int id)
        {
            this.categoryRepository.Delete(id);
        }

        // This API returns all categories in flat format
        [Route("api/category/flat")]
        [HttpGet]
        public Category[] GetAllFlat()
        {
            return this.categoryRepository.GetAllCategories();
        }

        // This API returns categories other than the one specified with the parameter id
        [Route("api/category/others/{id:int}")]
        [HttpGet] 
        public Category[] GetOtherCategories(int id)
        {            
            return this.categoryRepository.GetOtherCategoriesFlat(id);
        }

        // This API returns all categories excluding the selected category and its descendants
        [Route("api/category/othersExcludingChildren/{id:int}")]
        [HttpGet]
        public Category[] GetOthersExcludingChildrenCategories(int id)
        {
            return this.categoryRepository.GetOthersExcludingChildrenFlat(id);
        }
    }
}
