const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit']
    //Loop over removeFields and delete them from reqQuery 
    removeFields.forEach(param => delete reqQuery[param])

    // Create query string
    let queryStr = JSON.stringify(reqQuery) //query param as json string

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)//1st param-replace takes in regex, g=global means doesnt stop at the first it finds, 2nd param- takes in a function, match => what to return?

    // Finding resource 
    query = model.find(JSON.parse(queryStr))

    // Build & Sort adds onto our query
    // Select Fields- do this if select is included
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }
    // Sort
    if (req.query.sort) {
        //sort by multiple comma separated field values then turned into spaced strings
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        //default sort, descending created at
        query = query.sort('-createdAt')

    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25; //25 bootcamps by default
    const startIndex = (page - 1) * limit//gives us amount to skip, where we'll start
    const endIndex = page * limit
    const total = await model.countDocuments(); //method to count ALL the documents

    //later we populate with courses, but we havent created the courses resource
    query = query.skip(startIndex).limit(limit)
    //if something is passed into populate, set the query to w/e it is then add on populate and w/e is passed into populate - now this is generic as opposed to just dealing w bootcamps
    if (populate) {
        query = query.populate(populate)
    }
    // Executing our query- bootcamps, results, courses based on model
    const results = await query
    // Pagination result
    const pagination = {}

    // If we dont have a prev page, don't want to show a previous page. If we don't have a next page, if we're on the last page, dont' want to show the next page. 
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }
    next()
};

module.exports = advancedResults