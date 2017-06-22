using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using CategoryManager.Models;
using CategoryManager.DAL;

namespace CategoryManager.Services
{
    public class CategoryRepository
    {
        private CategorySqlite db = new CategorySqlite();

        public Category[] GetAllCategories()
        {
            return db.SelectAll();
        }

        private void PopulateChildren(Category cat, Category[] allCats)
        {
            Category[] children = (from c in allCats where c.ParentId == cat.Id select c).ToArray();
            cat.Children = children;
            foreach(Category c in children) { PopulateChildren(c, allCats); }
        }
        public Category[] GetCategoriesTree()
        {
            Category[] cats = db.SelectAll();
            Category[] firstNodes = (from cat in cats where cat.ParentId == null select cat).ToArray();
            foreach (Category c in firstNodes) { PopulateChildren(c, cats); }
            return firstNodes;
        }

        public Category[] GetOtherCategoriesFlat(int id)
        {
            List<Category> cats = GetAllCategories().ToList();
            cats.Remove(cats.Single(c => c.Id == id));            
            Category[] others = cats.ToArray();
            return others;
        }

        private void RemoveChildren(Category cat, List<Category> allCats)
        {
            allCats.Remove(allCats.Single(c => c.Id == cat.Id));
            if (cat.Children != null) foreach (Category c in cat.Children) { RemoveChildren(c, allCats); }
        }

        public Category[] GetOthersExcludingChildrenFlat(int id)
        {
            Category[] cats = GetAllCategories();
            List<Category> catList = cats.ToList();
            Category selected = (from cat in cats where cat.Id == id select cat).First();
            PopulateChildren(selected, cats);
            RemoveChildren(selected, catList);
            return catList.ToArray();
        }
        
        public void Save(Category category)
        {
            if (category.Id != null) 
            {
                db.Update(category);
            } else
            {
                db.Insert(category);
            }
        }

        public Category Get(int id)
        {
            return db.SelectById(id);
        }

        public void Delete(int id)
        {
            db.Delete(id);
        }
    }
}