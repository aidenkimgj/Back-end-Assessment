import express from 'express';
import axios from 'axios';
import NodeCache from 'node-cache';

const router = express.Router();
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

router.get('/', async (req, res) => {
  let { tags, sortBy, direction } = req.query;

  if (!tags)
    return res.status(400).json({ error: 'Tags parameter is required' });

  if (!sortBy) {
    sortBy = 'id';
  }
  if (!direction) {
    direction = 'asc';
  }

  switch (sortBy) {
    case 'id':
      break;
    case 'reads':
      break;
    case 'likes':
      break;
    case 'popularity':
      break;
    default:
      return res.status(400).json({ error: 'sortBy parameter is invalid' });
  }

  switch (direction) {
    case 'asc':
      break;
    case 'desc':
      break;
    default:
      return res.status(400).json({ error: 'direction parameter is invalid' });
  }

  const tagArr = tags.split(',');

  console.log('tags', tagArr);

  let map = new Map();
  let dataArr = [];

  //Retrieve all data

  for (let i = 0; i < tagArr.length; i++) {
    const cache = myCache.get(tagArr[i]);

    // Check cache
    if (cache) {
      dataArr = [...dataArr, ...cache];
    } else {
      try {
        const { data } = await axios.get(
          `https://api.hatchways.io/assessment/blog/posts?tag=${tagArr[i]}`
        );

        myCache.set(tagArr[i], data.posts);

        dataArr = [...dataArr, ...data.posts];
      } catch (e) {
        console.error(e);
        res.status(400).json(e);
      }
    }
  }

  // Get rid of duplicates
  for (let i = 0; i < dataArr.length; i++) {
    map.set(dataArr[i].id, dataArr[i]);
  }

  dataArr = [...map.values()];

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

  dataArr.sort((data1, data2) => {
    return compareObjects(data1, data2, sortBy);
  });

  if (direction === 'desc') {
    dataArr.reverse();
    return res.status(200).json({ posts: dataArr });
  }

  return res.status(200).json({ posts: dataArr });
});

export default router;
