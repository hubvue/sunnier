import { logger } from '@kever/logger'
import { InstancePool, Tag, InstanceType } from './instancePool'
import { propertyPool, toProxyInstance } from './proxy'

const instancePool = new InstancePool<Tag, InstanceType>()

/**
 * @description 标记当前类是可注入的
 * @param tag
 */
export const Injectable = (tag: Tag): ClassDecorator => (target) => {
  const ret = instancePool.bind(tag, (target as unknown) as InstanceType)
  if (!ret) {
    logger.error(` ${tag.toString()} model existence`)
    return
  }
  logger.info(`${target.name} is already registered for injection`)
  return target
}

/**
 * @description 注入类
 * @param tag
 */
export const Inject = <T>(tag: Tag, param?: T): PropertyDecorator => (
  target,
  propertyKey
) => {
  const instance = instancePool.use(tag)
  if (typeof instance === 'boolean') {
    instancePool.on(tag, (injectable) => {
      instancePoolEventHandler(target, propertyKey, injectable, param)
    })
  } else {
    instancePoolEventHandler(target, propertyKey, instance, param)
  }
}

function instancePoolEventHandler(
  target: Object,
  propertyKey: Tag,
  injectable: InstanceType,
  params: any
) {
  let parameter: any[]
  if (Array.isArray(params)) {
    parameter = params
  } else {
    parameter = [params]
  }
  const instanceModel = new injectable(...parameter)
  const proxyInstanceModel = toProxyInstance(instanceModel)

  const poolKey = target.constructor.name
  let pool = propertyPool.use(poolKey)

  if (typeof pool === 'boolean') {
    pool = new Map<string, unknown>()
    propertyPool.bind(poolKey, pool)
  }

  pool.set(propertyKey, proxyInstanceModel)

  logger.info(
    `Inject ${injectable.name} into the ${propertyKey.toString()} property of ${
      target.constructor.name
    }`
  )
}
