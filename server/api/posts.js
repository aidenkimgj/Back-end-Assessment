import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

router.get('/', async (req, res) => {
  let { tags, sortBy, direction } = req.query;
  let sortByArr = ['id', 'reads', 'likes', 'popularity'];
  let directionArr = ['asc', 'desc'];

  if (!tags)
    return res.status(400).json({ error: 'Tags parameter is required' });

  if (!sortBy) {
    sortBy = 'id';
  }
  if (!direction) {
    direction = 'asc';
  }

  if (!sortByArr.includes(sortBy)) {
    return res.status(400).json({ error: 'sortBy parameter is invalid' });
  }

  if (!directionArr.includes(direction)) {
    return res.status(400).json({ error: 'direction parameter is invalid' });
  }

  const tagArr = tags.split(',');

  let map = new Map();
  let dataArr1 = [];

  // Retrieve all data
  for (let i = 0; i < tagArr.length; i++) {
    const cache = myCache.get(tagArr[i]);

    // Check cache
    if (cache) dataArr1 = [...dataArr1, ...cache];
    else {
      try {
        const { data } = await axios.get(
          `https://api.hatchways.io/assessment/blog/posts?tag=${tagArr[i]}`
        );

        myCache.set(tagArr[i], data.posts);

        dataArr1 = [...dataArr1, ...data.posts];
      } catch (e) {
        console.error(e);
        res.status(400).json(e);
      }
    }
  }

  // Get rid of duplicates
  for (let i = 0; i < dataArr1.length; i++) {
    map.set(dataArr1[i].id, dataArr1[i]);
  }

  // No duplicated data in data array
  let dataArr2 = [...map.values()];

  const compareObjects = (_obj1, _obj2, key) => {
    const obj1 = _obj1[key];
    const obj2 = _obj2[key];

    if (obj1 < obj2) {
      return -1;
    }

    if (obj1 > obj2) {
      return 1;
    }
    return 0;
  };

  dataArr2.sort((data1, data2) => {
    return compareObjects(data1, data2, sortBy);
  });

  if (direction === 'desc') {
    dataArr2.reverse();
    return res.status(200).json({ posts: dataArr2 });
  }

  return res.status(200).json({ posts: dataArr2 });
});

export default router;
