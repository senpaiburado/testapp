import Router from 'koa-router';
import book from '../entities/BookEntity';
import convert from 'koa-convert';
import KoaBody from 'koa-body';

const router = new Router();
const koaBody = convert(KoaBody());

router
    .get('/book', async (ctx, next) => { // Example: http://localhost:3300/book?limit=5&sort.field=author&sort.order=asc&sort.field=date&offset=30&filter.field=image&filter.value=librarybook.jpg
        let params = {};
        if (ctx.query['sort.field'] && ctx.query['sort.order']) {
            params.sort = {
                fields: ctx.query['sort.field'],
                order: ctx.query['sort.order']
            };
        }
        if (ctx.query['filter.field'] && ctx.query['filter.value']) {
            params.filter = {
                field: ctx.query['filter.field'],
                value: ctx.query['filter.value']
            }
        }
        if (ctx.query.limit && ctx.query.offset) {
            params.limits = {
                limit: Number(ctx.query.limit),
                offset: Number(ctx.query.offset)
            };
        }
        ctx.body = await book.get(params);
    })
    .post('/book/add', koaBody, async (ctx, next) => {
        ctx.status = 201;
        ctx.body = await book.insert(ctx.request.body);
    })
    .put('/book/edit/:id', koaBody, async (ctx, next) => {
        ctx.status = 204;
        console.log(ctx.params.id, ctx.request.body);
        ctx.body = await book.update(ctx.params.id, ctx.request.body);
    });

export function routes() { return router.routes() }
export function allowedMethods() { return router.allowedMethods() }