﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SQLite;
using CategoryManager.Models;
using CategoryManager.Common;
using System.Configuration;

namespace CategoryManager.DAL
{
    
    public class CategorySqlite
    {
        private string connectionString { get; set; }

        public CategorySqlite()
        {
            connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["SqliteConnectionString"].ConnectionString;
        }

        private void ExecuteNonQuery(string sql)
        {
            using (SQLiteConnection conn = new SQLiteConnection(this.connectionString))
            {
                try
                {
                    conn.Open();
                    SQLiteCommand command = new SQLiteCommand(sql, conn);
                    command.ExecuteNonQuery();
                }
                finally
                {
                    conn.Close();
                }

            }
        }
        public void Insert(Category category) {
            string sql = String.Format(new NullFormat(), @"INSERT INTO category (name, parent_id) values ('{0}', {1})", category.Name, category.ParentId);
            ExecuteNonQuery(sql);
        }

        public void Update(Category category)
        {
            string sql = String.Format(new NullFormat(), @"UPDATE category SET name='{0}', parent_id={1} WHERE id={2}", category.Name, category.ParentId, category.Id);
            ExecuteNonQuery(sql);
        }

        public void Delete(int id)
        {
            // Before deleting a node, the children of that node must be appended to its parent (or the root node, which means no parentId) first
            string updateSql = String.Format(@"UPDATE category SET parent_id=(SELECT parent_id FROM category WHERE id={0}) WHERE parent_id={1}", id, id);
            ExecuteNonQuery(updateSql);
            string sql = String.Format(@"DELETE FROM category WHERE id={0}", id);
            ExecuteNonQuery(sql);
        }

        private List<Category> QueryCategory(string sql)
        {
            List<Category> result = new List<Category>();
            using (SQLiteConnection conn = new SQLiteConnection(this.connectionString))
            {
                try
                {
                    conn.Open();
                    using (SQLiteCommand cmd = new SQLiteCommand(sql, conn))
                    using (SQLiteDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            Category cat = new Category()
                            {
                                Id = rdr.GetInt32(rdr.GetOrdinal("id")), 
                                Name = rdr.GetString(rdr.GetOrdinal("name")),
                                ParentId = rdr["parent_id"] == System.DBNull.Value? 0 : rdr.GetInt32(rdr.GetOrdinal("parent_id"))
                            };
                            if (cat.ParentId == 0) cat.ParentId = null;
                            result.Add(cat);
                        }
                    }
                }
                finally
                {
                    conn.Close();
                }
            
            }
            return result;
        }

        public Category[] SelectAll()
        {
            string sql = @"SELECT * FROM category ORDER BY name COLLATE NOCASE ASC";
            return QueryCategory(sql).ToArray();
        }

        public Category SelectById(int id)
        {
            string sql = String.Format(@"SELECT * FROM category WHERE id={0} ORDER BY name COLLATE NOCASE ASC", id);
            return QueryCategory(sql)[0];
        }

        public Category[] SelectByParentId(int parentId)
        {
            string sql = String.Format(@"SELECT * FROM category WHERE parent_id={0} ORDER BY name COLLATE NOCASE ASC", parentId);
            return QueryCategory(sql).ToArray();
        }
    }
}