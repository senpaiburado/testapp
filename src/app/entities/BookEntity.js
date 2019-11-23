import query from 'mysql-query-promise';
import config from  'config';
const tableName = config.database.bookTableName;

export async function initTableRandomly() {
    let createTableCommand = `CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        date DATE,
        author VARCHAR(70) NOT NULL,
        description VARCHAR(1024),
        image VARCHAR(100)
    );`;

    await query(createTableCommand);

    let dataCount = (await query(`SELECT COUNT(*) AS count FROM ${tableName};`))[0].count;
    
    if (dataCount >= 1e5)
        return;

    console.log("Starting to fill table...");

    let fillTableCommand = `INSERT INTO ${tableName} VALUES(null, \":title\", \":date\", \":author\", \":description\", \":image\");`
    for (let i = 0; i < 1e5 - dataCount; i++) {
        let title = config.random_data.titles[Math.floor(Math.random() * config.random_data.titles.length)];
        let author = config.random_data.authors[Math.floor(Math.random() * config.random_data.authors.length)];
        let desc = config.random_data.descriptions[Math.floor(Math.random() * config.random_data.descriptions.length)];
        let imagePath = config.random_data.images_pathes[Math.floor(Math.random() * config.random_data.images_pathes.length)];
        let date = new Date((new Date(1990, 0, 1)).getTime() + Math.random() * ((new Date(2018, 10, 20)).getTime() - (new Date(1990, 0, 1)).getTime()));

        let command = String(fillTableCommand).replace(':title', title).replace(':date', date.toISOString().split('T')[0]).replace(':author', author)
                                              .replace(':description', desc).replace(':image', imagePath);

        await query(command);
    }
    console.log("Table is filled\n.");
}

const BookEntity = {
    get: async ({sort = {fields: [], order: null}, filter = {field: null, value: null}, limits = {limit: 0, offset: 0}} = {}) => {
        let command = `SELECT * FROM ${tableName} `;
        if (filter && filter.field && filter.value) {
            if (typeof filter.value === 'string')
                command += ` WHERE ${filter.field} = \"${filter.value}\" `;
            else
                command += ` WHERE ${filter.field} = ${filter.value} `;
        }
        if (sort && sort.fields.length > 0 && sort.order) {
            command += 'ORDER BY ' + sort.fields[0];
            for (let i = 1; i < sort.fields.length; i++)
                command += `,${sort.fields[i]} `;
            command += ` ${sort.order} `;
        }
        if (limits.limit > 0 && limits.offset > 0)
            command += ` LIMIT ${limits.limit} OFFSET ${limits.offset} `;
        return await query(`${command};`);
    },
    getById: async (id) => {
        return (await query(`SELECT * FROM ${tableName} WHERE id=${id};`))[0];
    },
    update: async (id, book) => {
        if (book.hasOwnProperty('title') && book.hasOwnProperty('author')) {
            let iBook = {};
            iBook.title = book.title;
            iBook.author = book.author;
            iBook.description = book.description || '';
            iBook.image = book.image || '';
            iBook.date = book.date || null;
            console.log(iBook);
            await query(`UPDATE ${tableName} SET title=\"${iBook.title}\", author=\"${iBook.author}\", description=\"${iBook.description}\",
                                    date=${iBook.date}, image=\"${iBook.image}\" WHERE id=${id};`);
            return await BookEntity.getById(id);
        }
        return null;
    },
    insert: async (book) => {
        if (book.hasOwnProperty('title') && book.hasOwnProperty('author')) {
            let iBook = {};
            iBook.title = book.title;
            iBook.author = book.author;
            iBook.description = book.description || '';
            iBook.image = book.image || '';
            iBook.date = book.date || null;
            let result = await query(`INSERT INTO ${tableName} VALUES(null, \"${iBook.title}\", ${iBook.date}, \"${iBook.author}\", 
                        \"${iBook.description}\", \"${iBook.image}\");`);
            return await BookEntity.getById(result.insertId);
        }
        return null;
    }
};

export default BookEntity;